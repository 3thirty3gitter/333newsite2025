
'use client';

import { PageSection } from "@/lib/types";

type SpacerSectionProps = {
  section: PageSection;
};

export const SpacerSection = ({ section }: SpacerSectionProps) => {
  const { height = 24 } = section.props; // Default height in px
  
  return (
    <div style={{ height: `${height}px` }} />
  );
};
