'use client';

import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/react-web/lib/host';
import { PLASMIC } from '@/plasmic-init';

export default function PlasmicHost() {
  if (!PLASMIC) {
    return null;
  }
  return <PlasmicCanvasHost />;
}