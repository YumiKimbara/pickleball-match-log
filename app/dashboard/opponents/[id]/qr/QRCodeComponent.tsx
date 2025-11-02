"use client";

import QRCode from "qrcode.react";

export default function QRCodeComponent({ value }: { value: string }) {
  return <QRCode value={value} size={200} level="M" />;
}
