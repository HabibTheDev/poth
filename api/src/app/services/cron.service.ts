import cron, { ScheduledTask } from 'node-cron';
import { UserService } from '../modules/User/user.service';
import { IncidentService } from '../modules/Incident/incident.service';
import { NotificationService } from '../modules/Notification/notification.service';
import logger from '../utils/logger';

let dailyJob: ScheduledTask | null = null;
let hourlyJob: ScheduledTask | null = null;

const cronService = {
  startCronJobs: () => {
    dailyJob = cron.schedule('0 2 * * *', async () => {
      try {
        const count = await UserService.disableExpiredNeverLoggedInUsers();
        if (count > 0) {
          logger.info(`Disabled ${count} user(s) who never logged in within 7 days`);
        }

        const expiredIncidents = await IncidentService.expireOldIncidents();
        if (expiredIncidents > 0) {
          logger.info(`Expired ${expiredIncidents} incident(s)`);
        }

        const purged = await NotificationService.cleanupOldNotifications(90);
        if (purged > 0) {
          logger.info(`Cleaned up ${purged} old notification(s)`);
        }
      } catch (err) {
        logger.error({ err }, 'Daily cron failed');
      }
    });

    hourlyJob = cron.schedule('0 * * * *', async () => {
      try {
        const expiredIncidents = await IncidentService.expireOldIncidents();
        if (expiredIncidents > 0) {
          logger.info(`Expired ${expiredIncidents} incident(s)`);
        }
      } catch (err) {
        logger.error({ err }, 'Hourly cron failed');
      }
    });

    UserService.disableExpiredNeverLoggedInUsers()
      .then((count) => {
        if (count > 0) {
          logger.info(`Startup: disabled ${count} expired never-logged-in user(s)`);
        }
      })
      .catch((err) => logger.error({ err }, 'Failed to disable expired users on startup'));

    logger.info('Cron jobs started');
  },
  stopCronJobs: () => {
    if (dailyJob) {
      dailyJob.stop();
      dailyJob = null;
    }
    if (hourlyJob) {
      hourlyJob.stop();
      hourlyJob = null;
    }
    logger.info('Cron jobs stopped');
  },
};

export default cronService;
