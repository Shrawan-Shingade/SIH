from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

def start():
    scheduler = BackgroundScheduler()
    # Run every 1 minute
    scheduler.add_job(
        lambda: call_command("generate_resource_data"),
        "interval",
        minutes=1,
        id="resource_data_job",
        replace_existing=True,
    )
    try:
        scheduler.start()
        logger.info("✅ APScheduler started: generate_resource_data every 1 minute")
    except Exception as e:
        logger.error(f"❌ APScheduler failed: {e}")
