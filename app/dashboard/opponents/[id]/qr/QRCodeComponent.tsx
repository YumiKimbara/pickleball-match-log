"use client";

import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeComponent({ value }: { value: string }) {
  return <QRCodeCanvas value={value} size={200} level="M" />;
}
