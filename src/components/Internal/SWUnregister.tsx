"use client";
import { useEffect } from "react";

export default function SWUnregister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((boolean) => {
            if (boolean) {
              console.log("Service worker unregistered successfully");
            } else {
              console.warn("Failed to unregister service worker");
            }
          });
        }
      });
    }
  }, []);
  return null;
}
