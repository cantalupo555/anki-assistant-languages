// Import necessary React components
import React from 'react';

// Define the props interface for the Notifications component
interface NotificationsProps {
  showSaveNotification: boolean;
  showExportNotification: boolean;
  showRemoveNotification: boolean;
  showClearAllNotification: boolean;
  showGenerateNotification: boolean;
}

// Define the Notifications component
const Notifications: React.FC<NotificationsProps> = ({
  showSaveNotification,
  showExportNotification,
  showRemoveNotification,
  showClearAllNotification,
  showGenerateNotification,
}) => {
  return (
    <>
      {/* Render the notification messages based on the prop values */}
      {showSaveNotification && (
        <div className="notification save-notification">
          Sentence and definition saved successfully!
        </div>
      )}

      {showExportNotification && (
        <div className="notification export-notification">
          Items exported successfully!
        </div>
      )}

      {showRemoveNotification && (
        <div className="notification remove-notification">
          Item removed successfully!
        </div>
      )}

      {showClearAllNotification && (
        <div className="notification clear-all-notification">
          All items cleared successfully!
        </div>
      )}

      {showGenerateNotification && (
        <div className="notification generate-notification">
          Word generated successfully!
        </div>
      )}
    </>
  );
};

export default Notifications;
