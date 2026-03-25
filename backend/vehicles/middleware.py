import time
import logging
from django.http import JsonResponse
from django.db import DatabaseError, OperationalError
from django.core.exceptions import DisallowedHost
from django.core.cache import cache

logger = logging.getLogger(__name__)

class RetryMiddleware:
    """Middleware para implementar reintentos automáticos en caso de errores de conexión"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.max_retries = 3
        self.retry_delay = 0.5

    def __call__(self, request):
        for attempt in range(self.max_retries):
            try:
                response = self.get_response(request)
                return response
            except (DatabaseError, OperationalError, ConnectionError) as e:
                logger.warning(f"Connection error on attempt {attempt + 1}: {e}")
                
                if attempt == self.max_retries - 1:
                    # Último intento fallido
                    logger.error(f"All retry attempts failed for {request.path}")
                    return JsonResponse({
                        'error': 'Servicio temporalmente no disponible',
                        'message': 'Por favor intenta nuevamente en unos momentos',
                        'retry_after': 30
                    }, status=503)
                
                # Esperar antes del siguiente intento
                time.sleep(self.retry_delay * (attempt + 1))
            except DisallowedHost:
                # No reintentar errores de host no permitido
                raise
            except Exception as e:
                # Para otros errores, no reintentar
                logger.error(f"Non-retryable error: {e}")
                raise

        return response


class CircuitBreakerMiddleware:
    """Middleware que implementa el patrón Circuit Breaker para prevenir cascadas de fallos"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.failure_threshold = 5
        self.recovery_timeout = 60
        self.half_open_max_calls = 3

    def __call__(self, request):
        circuit_key = f"circuit_breaker_{request.path}"
        failures = cache.get(f"{circuit_key}_failures", 0)
        last_failure = cache.get(f"{circuit_key}_last_failure", 0)
        state = cache.get(f"{circuit_key}_state", "closed")  # closed, open, half_open

        current_time = time.time()

        # Verificar si el circuito está abierto
        if state == "open":
            if current_time - last_failure < self.recovery_timeout:
                logger.warning(f"Circuit breaker OPEN for {request.path}")
                return JsonResponse({
                    'error': 'Servicio temporalmente no disponible',
                    'message': 'El servicio está experimentando problemas. Intenta más tarde.',
                    'retry_after': self.recovery_timeout
                }, status=503)
            else:
                # Transición a half-open
                cache.set(f"{circuit_key}_state", "half_open", 300)
                cache.set(f"{circuit_key}_half_open_calls", 0, 300)
                state = "half_open"

        # Verificar si está en estado half-open
        if state == "half_open":
            half_open_calls = cache.get(f"{circuit_key}_half_open_calls", 0)
            if half_open_calls >= self.half_open_max_calls:
                logger.warning(f"Circuit breaker HALF_OPEN limit reached for {request.path}")
                return JsonResponse({
                    'error': 'Servicio en recuperación',
                    'message': 'El servicio está recuperándose. Intenta en unos momentos.',
                    'retry_after': 30
                }, status=503)

        try:
            response = self.get_response(request)
            
            # Si la respuesta es exitosa y estamos en half-open, cerrar el circuito
            if state == "half_open" and response.status_code < 500:
                cache.delete(f"{circuit_key}_failures")
                cache.delete(f"{circuit_key}_last_failure")
                cache.set(f"{circuit_key}_state", "closed", 300)
                cache.delete(f"{circuit_key}_half_open_calls")
                logger.info(f"Circuit breaker CLOSED for {request.path}")
            
            return response
            
        except Exception as e:
            # Incrementar contador de fallos
            new_failures = failures + 1
            cache.set(f"{circuit_key}_failures", new_failures, 300)
            cache.set(f"{circuit_key}_last_failure", current_time, 300)
            
            if state == "half_open":
                # Si falla en half-open, volver a open
                cache.set(f"{circuit_key}_state", "open", 300)
                logger.warning(f"Circuit breaker reopened for {request.path}")
            elif new_failures >= self.failure_threshold:
                # Abrir el circuito
                cache.set(f"{circuit_key}_state", "open", 300)
                logger.error(f"Circuit breaker OPENED for {request.path} after {new_failures} failures")
            
            if state == "half_open":
                half_open_calls = cache.get(f"{circuit_key}_half_open_calls", 0)
                cache.set(f"{circuit_key}_half_open_calls", half_open_calls + 1, 300)
            
            raise e


class DatabaseResilienceMiddleware:
    """Middleware para manejar errores de base de datos con mayor resistencia"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger(__name__)

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except DatabaseError as e:
            self.logger.error(f"Database error: {e}")
            return JsonResponse({
                'error': 'Error de base de datos',
                'message': 'Problema temporal con la base de datos. Intenta nuevamente.',
                'retry_after': 30
            }, status=503)
        except OperationalError as e:
            self.logger.error(f"Operational error: {e}")
            return JsonResponse({
                'error': 'Error operacional',
                'message': 'Servicio temporalmente no disponible. Intenta más tarde.',
                'retry_after': 60
            }, status=503)