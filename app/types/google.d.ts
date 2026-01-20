// app/types/google.d.ts

// Import type từ thư viện @types/google.maps
/// <reference types="@types/google.maps" />

export {};

declare global {
  // Khai báo biến google tồn tại ở global scope
  const google: typeof google;

  interface Window {
    google: typeof google;
  }
}
