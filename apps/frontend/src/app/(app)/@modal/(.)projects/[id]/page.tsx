import { ProjectDrawer } from "@/components/projects/ProjectDrawer";

export default function ProjectModalPage({ params }: { params: { id: string } }) {
  return <ProjectDrawer projectId={params.id} />;
}
