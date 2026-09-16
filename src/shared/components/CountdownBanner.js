"use client";

import { useState, useEffect } from "react";

export default function CountdownBanner({ user }) {
  const [dismissed, setDismissed] = useState(false);

  if (!user || dismissed) return null;

  const { status, daysRemaining } = user;

  // Don't show for admin or users with plenty of days
  if (user.role === "admin" || (status === "active" && daysRemaining > 7)) {
    return null;
  }

  const isGrace = status === "grace";
  const isWarning = status === "active" && daysRemaining <= 7;

  const bgColor = isGrace ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200";
  const textColor = isGrace ? "text-red-800" : "text-yellow-800";
  const iconColor = isGrace ? "text-red-500" : "text-yellow-500";

  return (
    <div className={`border-l-4 p-4 mb-4 ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-xl ${iconColor}`}>
            {isGrace ? "⚠️" : "⏰"}
          </div>
          <div>
            <h3 className={`font-medium ${textColor}`}>
              {isGrace ? "Account in Grace Period" : "Subscription Expiring Soon"}
            </h3>
            <p className={`text-sm ${textColor} opacity-90`}>
              {isGrace
                ? `Your account expired ${Math.abs(daysRemaining)} day(s) ago. It will be permanently deleted soon. Contact administrator to extend.`
                : `Your subscription expires in ${daysRemaining} day(s). Please renew to avoid service interruption.`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className={`text-sm ${textColor} hover:opacity-70`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
