import importlib.metadata
import sys
import types

# Python 3.14 compatibility: shim for pkg_resources (removed from stdlib)
try:
    import pkg_resources
except ImportError:
    def _iter_entry_points(group, name=None):
        try:
            eps = importlib.metadata.entry_points(group=group)
            if name:
                eps = [ep for ep in eps if ep.name == name]
            return iter(eps)
        except Exception:
            return iter([])

    _pkg = types.ModuleType('pkg_resources')
    _pkg.get_distribution = lambda name: type('D', (), {'version': importlib.metadata.version(name)})()
    _pkg.DistributionNotFound = Exception
    _pkg.iter_entry_points = _iter_entry_points
    sys.modules['pkg_resources'] = _pkg

import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.db import SessionLocal
from app.routers.email import process_emails

logger = logging.getLogger(__name__)

_processing_lock = False

def _job_wrapper():
    global _processing_lock
    
    if _processing_lock:
        logger.info("Email processing already in progress, skipping this run")
        return
    
    _processing_lock = True
    session = SessionLocal()
    try:
        logger.info("Email scheduler: running job to process emails")
        try:
            process_emails(db=session)
        except Exception as e:
            logger.exception("Error while processing emails in scheduled job: %s", e)
    finally:
        session.close()
        _processing_lock = False


def start_email_scheduler(interval_seconds: int = 3):
    """Start a background scheduler that runs `_job_wrapper` every `interval_seconds` seconds."""
    # Suppress APScheduler's execution skipped logs
    logging.getLogger('apscheduler.executors.default').setLevel(logging.ERROR)
    logging.getLogger('apscheduler.scheduler').setLevel(logging.ERROR)
    
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        _job_wrapper, 
        IntervalTrigger(seconds=interval_seconds), 
        id="email_processor_job", 
        replace_existing=True,
        max_instances=1,
        coalesce=True
    )
    scheduler.start()
    logger.info("Started email scheduler with interval %s seconds", interval_seconds)
    return scheduler


def shutdown_scheduler(scheduler: BackgroundScheduler):
    if scheduler:
        scheduler.shutdown(wait=False)
        logger.info("Email scheduler shut down")
