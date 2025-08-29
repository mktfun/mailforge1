import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Monitor,
  Tablet,
  Smartphone,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash,
} from "lucide-react";

export type Block =
  | {
      type: "text";
      props: {
        text: string;
        fontSize?: number;
        color?: string;
        align?: "left" | "center" | "right";
      };
    }
  | {
      type: "image";
      props: { src: string; alt: string; width?: number; height?: number };
    }
  | {
      type: "button";
      props: {
        label: string;
        href: string;
        bg?: string;
        color?: string;
        align?: "left" | "center" | "right";
      };
    }
  | { type: "divider"; props: { color?: string } }
  | {
      type: "columns";
      props: { columnCount: 2 | 3; columns: { id: string; blocks: Block[] }[] };
    };

type Template = {
  id: string;
  user_id: string;
  name: string;
  content: string | null; // JSON string of Block[]
  created_at: string;
  updated_at: string;
};

const PALETTE: { key: Block["type"]; label: string }[] = [
  { key: "text", label: "Texto" },
  { key: "image", label: "Imagem" },
  { key: "button", label: "Botão" },
  { key: "divider", label: "Divisor" },
  { key: "columns", label: "Colunas" },
];

function defaultBlock(t: Block["type"]): Block {
  switch (t) {
    case "text":
      return {
        type: "text",
        props: {
          text: "Parágrafo de exemplo.",
          fontSize: 14,
          color: "#0F172A",
          align: "left",
        },
      };
    case "image":
      return {
        type: "image",
        props: {
          src: "https://placehold.co/600x200",
          alt: "Imagem",
          width: 600,
        },
      };
    case "button":
      return {
        type: "button",
        props: {
          label: "Call to Action",
          href: "#",
          bg: "#2563EB",
          color: "#FFFFFF",
          align: "left",
        },
      };
    case "divider":
      return { type: "divider", props: { color: "#E2E8F0" } };
    case "columns": {
      const id1 = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const id2 = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      return {
        type: "columns",
        props: {
          columnCount: 2,
          columns: [
            { id: id1, blocks: [] },
            { id: id2, blocks: [] },
          ],
        },
      } as Block;
    }
  }
}

function generateHtml(blocks: Block[]) {
  const parts: string[] = [];
  parts.push(
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-family: Inter, Arial, sans-serif;">',
  );
  parts.push('<tr><td align="center" style="padding:16px;">');
  parts.push(
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px; max-width:100%;">',
  );
  function renderBlocks(bs: Block[]) {
    for (const b of bs) {
      if (b.type === "text") {
        const s: string[] = ["padding:12px 0", "line-height:1.6"];
        if (b.props.color) s.push(`color:${b.props.color}`);
        if (b.props.fontSize) s.push(`font-size:${b.props.fontSize}px`);
        if (b.props.align) s.push(`text-align:${b.props.align}`);
        parts.push(
          `<tr><td style="${s.join("; ")}">${escapeHtml(b.props.text)}</td></tr>`,
        );
      } else if (b.type === "image") {
        const w = b.props.width ? `width:${b.props.width}px;` : "width:100%;";
        const h = b.props.height
          ? `height:${b.props.height}px;`
          : "height:auto;";
        parts.push(
          `<tr><td style="padding:12px 0;"><img src="${escapeAttr(b.props.src)}" alt="${escapeAttr(b.props.alt)}" style="display:block; ${w} ${h} border:0;"/></td></tr>`,
        );
      } else if (b.type === "button") {
        const bg = b.props.bg || "#2563EB";
        const color = b.props.color || "#FFFFFF";
        const align = b.props.align || "left";
        parts.push(
          `<tr><td style="padding:16px 0; text-align:${align};"><a href="${escapeAttr(b.props.href)}" style="background:${bg}; color:${color}; text-decoration:none; font-weight:600; padding:10px 16px; border-radius:6px; display:inline-block;">${escapeHtml(b.props.label)}</a></td></tr>`,
        );
      } else if (b.type === "divider") {
        const c = b.props.color || "#E2E8F0";
        parts.push(
          `<tr><td style=\"padding:8px 0;\"><hr style=\"border:none; border-top:1px solid ${c}; margin:0;\"/></td></tr>`,
        );
      } else if (b.type === "columns") {
        const count = b.props.columnCount;
        const layout = b.props.layout || "equal";
        let widths: number[];

        if (count === 2) {
          widths = layout === "70-30" ? [70, 30] : layout === "30-70" ? [30, 70] : [50, 50];
        } else {
          widths = [33, 34, 33];
        }

        parts.push(
          `<tr><td style=\"padding:12px 0;\"><table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\"><tr>`,
        );
        b.props.columns.slice(0, count).forEach((col, i) => {
          const w = widths[i];
          parts.push(
            `<td width=\"${w}%\" style=\"vertical-align:top; width:${w}%;\">`,
          );
          parts.push(
            '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">',
          );
          renderBlocks(col.blocks);
          parts.push("</table>");
          parts.push("</td>");
        });
        parts.push(`</tr></table></td></tr>`);
      } else if (b.type === "box") {
        const bg = b.props.backgroundColor || "transparent";
        const padding = b.props.padding || 0;
        const margin = b.props.margin || 0;
        const border = b.props.border || "none";
        const borderRadius = b.props.borderRadius || 0;

        parts.push(
          `<tr><td style=\"padding:${margin}px 0;\"><table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:${bg}; border:${border}; border-radius:${borderRadius}px;\"><tr><td style=\"padding:${padding}px;\">`,
        );
        parts.push(
          '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">',
        );
        renderBlocks(b.props.blocks);
        parts.push("</table>");
        parts.push("</td></tr></table></td></tr>");
      } else if (b.type === "spacer") {
        const height = b.props.height || 32;
        parts.push(
          `<tr><td style=\"height:${height}px; line-height:${height}px; font-size:1px;\">&nbsp;</td></tr>`,
        );
      }
    }
  }
  renderBlocks(blocks);
  parts.push("</table>");
  parts.push("</td></tr>");
  parts.push("</table>");
  return parts.join("");
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>\"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string,
  );
}
function escapeAttr(s: string) {
  return escapeHtml(s).replace(/\n/g, " ");
}

export default function TemplateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"preview" | "code">("preview");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [dragFromCol, setDragFromCol] = useState<{
    parent: number;
    colIndex: number;
    index: number;
  } | null>(null);
  const [colDrop, setColDrop] = useState<{
    parent: number;
    colIndex: number;
    index: number;
  } | null>(null);
  const [resizing, setResizing] = useState<{
    index: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    handle: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragImageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("templates")
        .select("id, user_id, name, content, created_at, updated_at")
        .eq("id", id)
        .single();
      if (!active) return;
      if (error) {
        setError(error.message);
      } else if (data) {
        setName(data.name);
        const raw = data.content;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const arr: any[] = Array.isArray(parsed)
              ? parsed
              : Array.isArray((parsed as any).blocks)
                ? (parsed as any).blocks
                : [];
            setBlocks(arr.map((b) => normalizeBlock(b)) as Block[]);
          } catch {
            setBlocks([
              {
                type: "text",
                props: {
                  text: String(raw),
                  fontSize: 14,
                  color: "#0F172A",
                  align: "left",
                },
              },
            ]);
          }
        } else {
          setBlocks([]);
        }
      }
      setLoading(false);
    }
    if (id) load();
    return () => {
      active = false;
    };
  }, [id]);

  // Global mouse handlers for image resize
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!resizing) return;
      setBlocks((prev) => {
        const idx = resizing.index;
        const blk = prev[idx];
        if (!blk || blk.type !== "image") return prev;
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - (resizing.startY || 0);
        const canvasW = canvasRef.current?.clientWidth ?? 640;
        let newW = blk.props.width ?? resizing.startW;
        let newH = blk.props.height ?? resizing.startH;
        if (resizing.handle.includes("e"))
          newW = Math.max(60, Math.round(resizing.startW + dx));
        if (resizing.handle.includes("w"))
          newW = Math.max(60, Math.round(resizing.startW - dx));
        if (resizing.handle.includes("s"))
          newH = Math.max(40, Math.round(resizing.startH + dy));
        if (resizing.handle.includes("n"))
          newH = Math.max(40, Math.round(resizing.startH - dy));
        newW = Math.min(canvasW - 16, newW);
        const next = [...prev];
        next[idx] = {
          ...blk,
          props: { ...blk.props, width: newW, height: newH || undefined },
        };
        return next;
      });
    }
    function onUp() {
      setResizing(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizing]);

  // Cursor feedback during resizing
  useEffect(() => {
    const prev = document.body.style.cursor;
    if (resizing) {
      document.body.style.cursor = "se-resize";
    } else {
      document.body.style.cursor = prev || "";
    }
    return () => {
      document.body.style.cursor = "";
    };
  }, [resizing]);

  function normalizeBlock(b: any): Block {
    if (b.type === "text")
      return {
        type: "text",
        props: {
          text: b.props?.text ?? "",
          fontSize: b.props?.fontSize ?? 14,
          color: b.props?.color ?? "#0F172A",
          align: b.props?.align ?? "left",
        },
      };
    if (b.type === "image")
      return {
        type: "image",
        props: {
          src: b.props?.src ?? "",
          alt: b.props?.alt ?? "",
          width: b.props?.width,
          height: b.props?.height,
        },
      };
    if (b.type === "button")
      return {
        type: "button",
        props: {
          label: b.props?.label ?? "CTA",
          href: b.props?.href ?? "#",
          bg: b.props?.bg ?? "#2563EB",
          color: b.props?.color ?? "#FFFFFF",
          align: b.props?.align ?? "left",
        },
      };
    if (b.type === "divider")
      return { type: "divider", props: { color: b.props?.color ?? "#E2E8F0" } };
    if (b.type === "columns") {
      const count = b.props?.columnCount === 3 ? 3 : 2;
      const layout = b.props?.layout || "equal";
      const cols = Array.isArray(b.props?.columns) ? b.props.columns : [];
      return {
        type: "columns",
        props: {
          columnCount: count,
          layout: layout,
          columns: cols
            .slice(0, count)
            .map((c: any) => ({
              id:
                c?.id ??
                `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              blocks: Array.isArray(c?.blocks)
                ? c.blocks.map((bb: any) => normalizeBlock(bb))
                : [],
            })),
        },
      } as Block;
    }
    if (b.type === "box") {
      const blocks = Array.isArray(b.props?.blocks) ? b.props.blocks : [];
      return {
        type: "box",
        props: {
          backgroundColor: b.props?.backgroundColor ?? "transparent",
          padding: b.props?.padding ?? 16,
          margin: b.props?.margin ?? 0,
          border: b.props?.border ?? "1px solid #E2E8F0",
          borderRadius: b.props?.borderRadius ?? 8,
          blocks: blocks.map((bb: any) => normalizeBlock(bb)),
        },
      };
    }
    if (b.type === "spacer") {
      return {
        type: "spacer",
        props: {
          height: b.props?.height ?? 32,
        },
      };
    }
    return defaultBlock("text");
  }

  const html = useMemo(() => generateHtml(blocks), [blocks]);
  const canvasWidth =
    device === "desktop" ? 640 : device === "tablet" ? 480 : 360;

  function onDragStartPalette(e: React.DragEvent, type: Block["type"]) {
    e.dataTransfer.setData("application/x-block-type", type);
    e.dataTransfer.effectAllowed = "copy";
  }
  function onDragOverCanvas(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDropCanvas(e: React.DragEvent) {
    e.preventDefault();
    const type = e.dataTransfer.getData(
      "application/x-block-type",
    ) as Block["type"];
    const presetKey = e.dataTransfer.getData("application/x-preset");

    if (type) {
      const insertAt = dropIndex ?? blocks.length;
      setBlocks((prev) => {
        const arr = [...prev];
        arr.splice(insertAt, 0, defaultBlock(type));
        return arr;
      });
      if (type === "columns") {
        setSelected(insertAt);
      }
      setDropIndex(null);
    } else if (presetKey) {
      const preset = PRESETS.find(p => p.key === presetKey);
      if (preset) {
        const insertAt = dropIndex ?? blocks.length;
        setBlocks((prev) => {
          const arr = [...prev];
          arr.splice(insertAt, 0, ...preset.blocks);
          return arr;
        });
        setDropIndex(null);
      }
    }
  }

  function startReorder(e: React.DragEvent, index: number) {
    setDragFrom(index);
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const ghost = target.cloneNode(true) as HTMLDivElement;
    ghost.style.position = "fixed";
    ghost.style.top = "-9999px";
    ghost.style.left = "-9999px";
    ghost.style.width = `${rect.width}px`;
    ghost.style.opacity = "0.6";
    ghost.style.pointerEvents = "none";
    ghost.style.transform = "scale(0.98)";
    ghost.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
    document.body.appendChild(ghost);
    dragImageRef.current = ghost;
    try {
      e.dataTransfer.setDragImage(ghost, Math.min(24, rect.width / 4), 16);
    } catch {}
  }
  function onDragOverZone(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDropIndex(index);
  }
  function onDragOverColZone(
    e: React.DragEvent,
    parent: number,
    colIndex: number,
    index: number,
  ) {
    e.preventDefault();
    setColDrop({ parent, colIndex, index });
  }
  function onDropZone(e: React.DragEvent, index: number) {
    e.preventDefault();
    const from = dragFrom;
    setDragFrom(null);
    const to = index;
    setDropIndex(null);
    if (from == null || from === to) return;
    setBlocks((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      const insertAt = from < to ? to - 1 : to;
      arr.splice(insertAt, 0, item);
      return arr;
    });
  }

  function onDropColZone(
    e: React.DragEvent,
    parent: number,
    colIndex: number,
    index: number,
  ) {
    e.preventDefault();
    const from = dragFromCol;
    setDragFromCol(null);
    setColDrop(null);
    const type = e.dataTransfer.getData(
      "application/x-block-type",
    ) as Block["type"];
    if (!from && !type) return;
    setBlocks((prev) => {
      const arr = [...prev];
      const parentBlk = arr[parent];
      if (!parentBlk) return prev;

      let targetBlocks: Block[];
      if (parentBlk.type === "columns") {
        const col = parentBlk.props.columns[colIndex];
        targetBlocks = col.blocks;
      } else if (parentBlk.type === "box") {
        targetBlocks = parentBlk.props.blocks;
      } else {
        return prev;
      }

      if (from && from.parent === parent && from.colIndex === colIndex) {
        const [item] = targetBlocks.splice(from.index, 1);
        const insertAt = from.index < index ? index - 1 : index;
        targetBlocks.splice(insertAt, 0, item);
      } else if (type) {
        targetBlocks.splice(index, 0, defaultBlock(type));
      }
      return arr;
    });
  }

  function addBlock(type: Block["type"]) {
    setBlocks((prev) => [...prev, defaultBlock(type)]);
  }

  async function handleSave() {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nome é obrigatório");
      toast.error("Nome é obrigatório");
      return;
    }
    const payload = JSON.stringify(blocks);
    const { error } = await supabase
      .from("templates")
      .update({ name: trimmed, content: payload })
      .eq("id", id as string);
    if (error) {
      setError(error.message);
      toast.error(error.message || "Erro ao salvar template");
      return;
    }
    toast.success("Template salvo com sucesso!");
    startTransition(() => navigate("/templates"));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <div className="mt-2">
              <Skeleton className="h-4 w-60" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-4 h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do Template"
            className="w-72"
          />
          {(!name.trim() || error) && (
            <span className="text-sm text-destructive">
              {error || "Nome é obrigatório"}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>
            Salvar
          </Button>
        </div>
      </div>

      {/* 3-column editor */}
      <div className="grid gap-4 md:grid-cols-[240px_1fr_320px]">
        {/* Left: components palette */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ferramentas</CardTitle>
            <CardDescription>Arraste para o canvas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              {PALETTE.map((p) => (
                <div
                  key={p.key}
                  draggable
                  onDragStart={(e) => onDragStartPalette(e, p.key)}
                  onClick={() => addBlock(p.key)}
                  className="flex cursor-grab items-center justify-between rounded border bg-background px-3 py-2 text-sm hover:bg-accent"
                >
                  <span>{p.label}</span>
                  <span className="text-xs text-muted-foreground">arraste</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Layouts Prontos</h4>
              <div className="grid gap-2">
                {PRESETS.map((preset) => (
                  <div
                    key={preset.key}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/x-preset", preset.key);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => {
                      setBlocks((prev) => [...prev, ...preset.blocks]);
                    }}
                    className="flex cursor-grab items-center justify-between rounded border bg-secondary/20 px-3 py-2 text-sm hover:bg-secondary/40"
                  >
                    <span>{preset.label}</span>
                    <span className="text-xs text-muted-foreground">arraste</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Middle: canvas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                  <TabsList>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Código</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={device === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevice("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === "tablet" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevice("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevice("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Construa seu email e visualize o resultado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {view === "preview" ? (
              <div className="w-full flex justify-center">
                <div
                  ref={canvasRef}
                  className={
                    "min-h-[360px] rounded border bg-white p-4 " +
                    (resizing ? "cursor-se-resize" : "")
                  }
                  style={{ width: canvasWidth, maxWidth: "100%" }}
                  onDragOver={onDragOverCanvas}
                  onDrop={onDropCanvas}
                >
                  {/* first drop zone */}
                  <DropZone
                    active={dropIndex === 0}
                    onDragOver={(e) => onDragOverZone(e, 0)}
                    onDrop={(e) => onDropZone(e, 0)}
                  />
                  <div className="space-y-2">
                    {blocks.map((b, idx) => (
                      <div key={idx}>
                        <div
                          draggable
                          onDragStart={(e) => startReorder(e, idx)}
                          onDragEnd={() => {
                            setDragFrom(null);
                            setDropIndex(null);
                            if (dragImageRef.current) {
                              dragImageRef.current.remove();
                              dragImageRef.current = null;
                            }
                          }}
                          onClick={() => setSelected(idx)}
                          className={
                            "relative rounded-md border p-2 transition-colors " +
                            (selected === idx
                              ? "border-2 border-primary ring-4 ring-primary/20"
                              : dragFrom === idx
                                ? "opacity-60 border-muted"
                                : "border-transparent hover:border-muted")
                          }
                        >
                          <RenderBlock
                            block={b}
                            selected={selected === idx}
                            editing={editingIndex === idx}
                            onStartEdit={() => setEditingIndex(idx)}
                            onEndEdit={() => setEditingIndex(null)}
                            onChangeText={(val) =>
                              setBlocks((prev) =>
                                prev.map((bb, i) =>
                                  i === idx && b.type === "text"
                                    ? {
                                        ...bb,
                                        props: { ...bb.props, text: val },
                                      }
                                    : bb,
                                ),
                              )
                            }
                            onStartResize={(startX, startW) =>
                              setResizing({ index: idx, startX, startW })
                            }
                          />
                        </div>
                        {/* drop zone after each block */}
                        <DropZone
                          active={dropIndex === idx + 1}
                          onDragOver={(e) => onDragOverZone(e, idx + 1)}
                          onDrop={(e) => onDropZone(e, idx + 1)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 max-h-[60vh] overflow-auto rounded border bg-muted p-4">
                <Textarea
                  className="font-mono text-xs min-h-[300px]"
                  value={html}
                  readOnly
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: properties panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Propriedades</CardTitle>
            <CardDescription>
              {selected == null
                ? "Selecione um componente"
                : "Editar propriedades"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selected == null ? (
              <p className="text-sm text-muted-foreground">
                Selecione um componente para editar suas propriedades nesta
                área.
              </p>
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setBlocks((prev) =>
                        prev.filter((_, i) => i !== selected),
                      );
                      setSelected(null);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    Deletar Componente
                  </Button>
                </div>
                <PropertiesEditor
                  block={blocks[selected]}
                  onChange={(patch) =>
                    setBlocks((prev) => {
                      const next = [...prev];
                      next[selected!] = {
                        ...next[selected!],
                        props: { ...next[selected!].props, ...patch },
                      } as any;
                      return next;
                    })
                  }
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DropZone({
  active,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={"my-1 transition-all " + (active ? "h-8" : "h-2")}
    >
      <div
        className={
          "mx-1 h-full rounded border-2 border-dashed transition-colors " +
          (active ? "border-primary bg-primary/10" : "border-transparent")
        }
      />
    </div>
  );
}

function RenderBlock({
  block,
  selected,
  editing,
  onStartEdit,
  onEndEdit,
  onChangeText,
  onStartResize,
  onStartColDrag,
  onDropColZone,
  onDragOverColZone,
}: {
  block: Block;
  selected: boolean;
  editing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onChangeText: (val: string) => void;
  onStartResize: (
    handle: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw",
    startX: number,
    startY: number,
    startW: number,
    startH: number,
  ) => void;
  onStartColDrag?: (colIndex: number, childIndex: number) => void;
  onDropColZone?: (colIndex: number, index: number, e: React.DragEvent) => void;
  onDragOverColZone?: (
    colIndex: number,
    index: number,
    e: React.DragEvent,
  ) => void;
}) {
  if (block.type === "text") {
    return (
      <div className="w-full">
        {editing ? (
          (() => {
            const taRef = useRef<HTMLTextAreaElement | null>(null);
            useEffect(() => {
              if (taRef.current) {
                taRef.current.focus();
                taRef.current.select();
              }
            }, []);
            return (
              <Textarea
                ref={taRef}
                autoFocus
                value={block.props.text}
                onChange={(e) => onChangeText(e.target.value)}
                onBlur={onEndEdit}
                className="min-h-[80px]"
              />
            );
          })()
        ) : (
          <div
            className="text-sm text-foreground"
            style={{
              fontSize: block.props.fontSize,
              color: block.props.color,
              textAlign: block.props.align as any,
            }}
            onDoubleClick={onStartEdit}
          >
            {block.props.text || ""}
          </div>
        )}
      </div>
    );
  }
  if (block.type === "image") {
    const w = block.props.width ? `${block.props.width}px` : undefined;
    const h = block.props.height ? `${block.props.height}px` : undefined;
    const handle = (
      pos: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw",
      e: React.MouseEvent,
    ) => {
      const imgEl =
        (e.currentTarget.parentElement?.querySelector(
          "img",
        ) as HTMLImageElement) || undefined;
      const startW = block.props.width ?? imgEl?.clientWidth ?? 300;
      const startH = block.props.height ?? imgEl?.clientHeight ?? 150;
      onStartResize(pos, e.clientX, e.clientY, startW, startH);
    };
    return (
      <div className="relative inline-block">
        <img
          src={block.props.src}
          alt={block.props.alt}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/600x200?text=Imagem";
          }}
          className="h-auto max-w-full rounded border object-cover select-none"
          style={{ width: w, height: h }}
        />
        {selected && (
          <>
            <span
              onMouseDown={(e) => handle("nw", e)}
              className="absolute -top-1 -left-1 size-3 cursor-nwse-resize rounded-sm bg-primary"
            />
            <span
              onMouseDown={(e) => handle("n", e)}
              className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 cursor-n-resize rounded-sm bg-primary"
            />
            <span
              onMouseDown={(e) => handle("ne", e)}
              className="absolute -top-1 -right-1 size-3 cursor-nesw-resize rounded-sm bg-primary"
            />
            <span
              onMouseDown={(e) => handle("w", e)}
              className="absolute top-1/2 -left-1 size-3 -translate-y-1/2 cursor-w-resize rounded-sm bg-primary"
            />
            <span
              onMouseDown={(e) => handle("e", e)}
              className="absolute top-1/2 -right-1 size-3 -translate-y-1/2 cursor-e-resize rounded-sm bg-primary"
            />
            <span
              onMouseDown={(e) => handle("sw", e)}
              className="absolute -bottom-1 -left-1 size-3 cursor-nesw-resize rounded-sm bg-primary"
            />
            <span
              onMouseDown={(e) => handle("s", e)}
              className="absolute -bottom-1 left-1/2 size-3 -translate-x-1/2 cursor-s-resize rounded-sm bg-primary"
            />
            <span
              onMouseDown={(e) => handle("se", e)}
              className="absolute -bottom-1 -right-1 size-4 md:size-5 cursor-nwse-resize rounded-sm bg-primary ring-2 ring-white shadow"
            />
          </>
        )}
      </div>
    );
  }
  if (block.type === "button") {
    const bg = block.props.bg || "#2563EB";
    const color = block.props.color || "#FFFFFF";
    const align = block.props.align || "left";
    return (
      <div style={{ textAlign: align as any }}>
        <Button asChild style={{ background: bg, color }}>
          <a href={block.props.href}>{block.props.label}</a>
        </Button>
      </div>
    );
  }
  if (block.type === "divider") {
    return (
      <div
        className="h-px w-full"
        style={{ backgroundColor: block.props.color || "#E2E8F0" }}
      />
    );
  }
  if (block.type === "columns") {
    const count = block.props.columnCount;
    const layout = block.props.layout || "equal";
    const cols = block.props.columns.slice(0, count);

    let gridTemplate: string;
    if (count === 2) {
      gridTemplate = layout === "70-30" ? "7fr 3fr" : layout === "30-70" ? "3fr 7fr" : "1fr 1fr";
    } else {
      gridTemplate = `repeat(${count}, minmax(0, 1fr))`;
    }

    return (
      <div className="w-full">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {cols.map((col, ci) => (
            <div key={col.id} className="rounded border p-2">
              <DropZone
                active={false}
                onDragOver={(e) => onDragOverColZone?.(ci, 0, e)}
                onDrop={(e) => onDropColZone?.(ci, 0, e)}
              />
              <div className="space-y-2">
                {col.blocks.map((child, childIdx) => (
                  <div key={childIdx}>
                    <div
                      draggable
                      onDragStart={() => onStartColDrag?.(ci, childIdx)}
                      className="relative rounded border p-2 hover:border-muted"
                    >
                      <RenderBlock
                        block={child as any}
                        selected={false}
                        editing={false}
                        onStartEdit={() => {}}
                        onEndEdit={() => {}}
                        onChangeText={() => {}}
                        onStartResize={() => {}}
                        onStartColDrag={onStartColDrag}
                        onDropColZone={onDropColZone}
                        onDragOverColZone={onDragOverColZone}
                      />
                    </div>
                    <DropZone
                      active={false}
                      onDragOver={(e) =>
                        onDragOverColZone?.(ci, childIdx + 1, e)
                      }
                      onDrop={(e) => onDropColZone?.(ci, childIdx + 1, e)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (block.type === "box") {
    const { backgroundColor, padding, margin, border, borderRadius } = block.props;
    return (
      <div
        className="w-full min-h-[60px] rounded border-2 border-dashed border-muted"
        style={{
          backgroundColor: backgroundColor || "transparent",
          padding: `${padding || 16}px`,
          margin: `${margin || 0}px 0`,
          border: border || "1px solid #E2E8F0",
          borderRadius: `${borderRadius || 8}px`,
        }}
      >
        <DropZone
          active={false}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const type = e.dataTransfer.getData("application/x-block-type") as Block["type"];
            if (type && onDropColZone) {
              onDropColZone(0, 0, e);
            }
          }}
        />
        <div className="space-y-2">
          {block.props.blocks.map((child, childIdx) => (
            <div key={childIdx}>
              <div
                draggable
                onDragStart={() => onStartColDrag?.(0, childIdx)}
                className="relative rounded border p-2 hover:border-muted"
              >
                <RenderBlock
                  block={child as any}
                  selected={false}
                  editing={false}
                  onStartEdit={() => {}}
                  onEndEdit={() => {}}
                  onChangeText={() => {}}
                  onStartResize={() => {}}
                  onStartColDrag={onStartColDrag}
                  onDropColZone={onDropColZone}
                  onDragOverColZone={onDragOverColZone}
                />
              </div>
              <DropZone
                active={false}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const type = e.dataTransfer.getData("application/x-block-type") as Block["type"];
                  if (type && onDropColZone) {
                    onDropColZone(0, childIdx + 1, e);
                  }
                }}
              />
            </div>
          ))}
        </div>
        {block.props.blocks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            Arraste componentes aqui
          </div>
        )}
      </div>
    );
  }
  if (block.type === "spacer") {
    const height = block.props.height || 32;
    return (
      <div
        className="w-full bg-muted/20 border border-dashed border-muted rounded flex items-center justify-center text-xs text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        Espaçador ({height}px)
      </div>
    );
  }
  return null;
}

function PropertiesEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (patch: Record<string, any>) => void;
}) {
  if (block.type === "text") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Conteúdo</label>
          <Textarea
            value={block.props.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tamanho (px)</label>
            <Input
              type="number"
              value={block.props.fontSize ?? 14}
              onChange={(e) =>
                onChange({ fontSize: Number(e.target.value || 0) })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Cor</label>
            <Input
              type="text"
              value={block.props.color ?? "#0F172A"}
              onChange={(e) => onChange({ color: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Alinhamento</label>
          <div className="flex gap-2">
            <Button
              variant={block.props.align === "left" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ align: "left" })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={block.props.align === "center" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ align: "center" })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={block.props.align === "right" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ align: "right" })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (block.type === "button") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Texto</label>
          <Input
            value={block.props.label}
            onChange={(e) => onChange({ label: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">URL</label>
          <Input
            value={block.props.href}
            onChange={(e) => onChange({ href: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Cor do botão</label>
            <Input
              value={block.props.bg ?? "#2563EB"}
              onChange={(e) => onChange({ bg: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Cor do texto</label>
            <Input
              value={block.props.color ?? "#FFFFFF"}
              onChange={(e) => onChange({ color: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Alinhamento</label>
          <div className="flex gap-2">
            <Button
              variant={block.props.align === "left" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ align: "left" })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={block.props.align === "center" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ align: "center" })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={block.props.align === "right" ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ align: "right" })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  if (block.type === "image") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">URL da Imagem</label>
          <Input
            value={block.props.src}
            onChange={(e) => onChange({ src: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Alt text</label>
          <Input
            value={block.props.alt}
            onChange={(e) => onChange({ alt: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Largura (px)</label>
            <Input
              type="number"
              value={block.props.width ?? ""}
              onChange={(e) =>
                onChange({
                  width: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Altura (px)</label>
            <Input
              type="number"
              value={block.props.height ?? ""}
              onChange={(e) =>
                onChange({
                  height: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }
  if (block.type === "divider") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Cor</label>
          <Input
            value={block.props.color ?? "#E2E8F0"}
            onChange={(e) => onChange({ color: e.target.value })}
          />
        </div>
      </div>
    );
  }
  if (block.type === "columns") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo de Coluna</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={block.props.columnCount === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ columnCount: 2 })}
            >
              2 Colunas
            </Button>
            <Button
              variant={block.props.columnCount === 3 ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ columnCount: 3 })}
            >
              3 Colunas
            </Button>
          </div>
        </div>
        {block.props.columnCount === 2 && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Layout</label>
            <div className="grid gap-2">
              <Button
                variant={block.props.layout === "equal" ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ layout: "equal" })}
              >
                Igual (50/50)
              </Button>
              <Button
                variant={block.props.layout === "70-30" ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ layout: "70-30" })}
              >
                Esquerda Maior (70/30)
              </Button>
              <Button
                variant={block.props.layout === "30-70" ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ layout: "30-70" })}
              >
                Direita Maior (30/70)
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  if (block.type === "box") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Cor de Fundo</label>
          <Input
            type="text"
            value={block.props.backgroundColor ?? "transparent"}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            placeholder="transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Padding (px)</label>
            <Input
              type="number"
              value={block.props.padding ?? 16}
              onChange={(e) => onChange({ padding: Number(e.target.value || 0) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Margin (px)</label>
            <Input
              type="number"
              value={block.props.margin ?? 0}
              onChange={(e) => onChange({ margin: Number(e.target.value || 0) })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Borda</label>
          <Input
            type="text"
            value={block.props.border ?? "1px solid #E2E8F0"}
            onChange={(e) => onChange({ border: e.target.value })}
            placeholder="1px solid #E2E8F0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Borda Arredondada (px)</label>
          <Input
            type="number"
            value={block.props.borderRadius ?? 8}
            onChange={(e) => onChange({ borderRadius: Number(e.target.value || 0) })}
          />
        </div>
      </div>
    );
  }
  if (block.type === "spacer") {
    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Altura (px)</label>
          <Input
            type="number"
            value={block.props.height ?? 32}
            onChange={(e) => onChange({ height: Number(e.target.value || 32) })}
          />
        </div>
      </div>
    );
  }
  return null;
}
