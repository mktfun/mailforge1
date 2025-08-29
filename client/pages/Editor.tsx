import { useParams } from "react-router-dom";
import MainLayout from "@/components/layouts/MainLayout";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  return (
    <MainLayout>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Página do Editor</h1>
        <p className="text-muted-foreground">Editor para campanha #{id}</p>
      </div>
    </MainLayout>
  );
}
