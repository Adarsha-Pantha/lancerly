"use client";

import { ProjectDrawer } from "@/components/projects/ProjectDrawer";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id: projectId } = params;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* 
        Standalone page wraps the ProjectDrawer components but removes the overlay/sidebar constraints.
      */}
      <div className="standalone-view">
        <ProjectDrawer projectId={projectId} />
      </div>

      <style jsx global>{`
        /* Remove the fixed positioning and overlay background for standalone page */
        .standalone-view .fixed.inset-0 {
          position: relative !important;
          background: transparent !important;
          display: block !important;
          backdrop-filter: none !important;
          z-index: 1 !important;
        }
        
        .standalone-view .max-w-4xl {
          max-width: 100% !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          border-left: none !important;
          height: auto !important;
        }

        /* Adjust the trigger button for full-width content */
        .standalone-view .w-full.max-w-4xl {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
