import { ProjectDetail } from '@/components/project-detail';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetail id={String(params.id)} />;
}

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}
