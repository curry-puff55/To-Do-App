"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "complete";
  priority: "high" | "medium" | "low";
  dueDate?: string; // ISO date string
}

interface ListTemplate {
  title: string;
  description?: string;
  tasks: TaskItem[];
  tags: string[];
  public: boolean;
}

/**
 * GHOSTS COLOR PALETTE
 *
 * Light Mode:
 * #FAFAFF (Spectral White) - Main background
 * #F4F4F9 (Fog) - Secondary backgrounds
 * #E8E8F2 (Mist) - Borders
 * #C5C5E0 (Lavender Mist) - Muted text
 * #9B9BC8 (Ghost) - Accent color
 * #7B7BAF (Spirit) - Primary actions
 * #E0E0F5 (Whisper) - Hover backgrounds
 *
 * Dark Mode:
 * #0F0F1A (Void) - Main background
 * #1A1A2E (Shadow) - Secondary backgrounds
 * #2A2A45 (Darkness) - Borders
 * #4A4A6A (Phantom) - Muted text
 * #6B6B9A (Apparition) - Accent color
 * #8B8BB8 (Specter) - Bright accents
 */

// Droppable Column Component
function DroppableColumn({
  id,
  children,
  darkMode,
}: {
  id: string;
  children: React.ReactNode;
  darkMode: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`backdrop-blur-xl rounded-2xl border p-6 shadow-lg min-h-[600px] transition-all ${
        isOver ? "ring-2 ring-opacity-50" : ""
      } ${
        darkMode
          ? `bg-[#1A1A2E]/60 border-[#2A2A45]/60 ${isOver ? "ring-[#6B6B9A]" : ""}`
          : `bg-white/60 border-[#E8E8F2]/60 ${isOver ? "ring-[#9B9BC8]" : ""}`
      }`}
    >
      {children}
    </div>
  );
}

// Preview Draggable Task Component (for Manifest mode)
function PreviewDraggableTask({
  task,
  darkMode,
}: {
  task: TaskItem;
  darkMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 backdrop-blur-sm rounded-xl border transition-all duration-400 ${
        task.status === "complete" ? "opacity-40 blur-[0.3px]" : ""
      } ${
        darkMode
          ? "bg-[#2A2A45]/40 border-[#4A4A6A]/60 hover:bg-[#2A2A45]/60"
          : "bg-white/40 border-[#E8E8F2]/60 hover:bg-white/60"
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing ${
          darkMode ? "text-[#4A4A6A] hover:text-[#6B6B9A]" : "text-[#C5C5E0] hover:text-[#9B9BC8]"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <input
        type="checkbox"
        checked={task.status === "complete"}
        readOnly
        className={`w-4 h-4 rounded ${
          darkMode ? "border-[#4A4A6A] text-[#6B6B9A]" : "border-[#E8E8F2] text-[#9B9BC8]"
        }`}
      />
      <span className={`flex-1 text-sm ${task.status === "complete" ? "line-through" : ""} ${
        darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"
      }`}>
        {task.title}
      </span>
    </div>
  );
}

// Draggable Task Component
function DraggableTask({
  task,
  darkMode,
  updateTaskDate,
  updateTaskTitle,
  toggleTaskStatus,
  deleteTask
}: {
  task: TaskItem;
  darkMode: boolean;
  updateTaskDate: (id: string, date: string) => void;
  updateTaskTitle: (id: string, title: string) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      updateTaskTitle(task.id, editValue);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group backdrop-blur-sm rounded-xl border p-4 transition-all duration-300 ${
        task.status === "complete" ? "opacity-40" : ""
      } ${
        darkMode
          ? "bg-[#2A2A45]/40 border-[#4A4A6A]/60 hover:bg-[#2A2A45]/60"
          : "bg-white/40 border-[#E8E8F2]/60 hover:bg-white/60"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={`mt-1 cursor-grab active:cursor-grabbing ${
            darkMode ? "text-[#4A4A6A] hover:text-[#6B6B9A]" : "text-[#C5C5E0] hover:text-[#9B9BC8]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.status === "complete"}
          onChange={() => toggleTaskStatus(task.id)}
          className={`mt-1 w-4 h-4 rounded transition-all ${
            darkMode
              ? "border-[#4A4A6A] text-[#6B6B9A] focus:ring-[#6B6B9A]"
              : "border-[#E8E8F2] text-[#9B9BC8] focus:ring-[#9B9BC8]"
          } focus:ring-offset-0`}
        />

        {/* Task Content */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
              autoFocus
              className={`w-full px-2 py-1 text-sm backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-1 ${
                darkMode
                  ? "bg-[#1A1A2E]/50 border-[#4A4A6A] text-[#8B8BB8] focus:ring-[#6B6B9A]"
                  : "bg-white/50 border-[#E8E8F2] text-[#7B7BAF] focus:ring-[#9B9BC8]"
              }`}
            />
          ) : (
            <p
              onClick={() => setIsEditing(true)}
              className={`text-sm cursor-text ${task.status === "complete" ? "line-through" : ""} ${
                darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"
              }`}
            >
              {task.title}
            </p>
          )}

          {/* Date Picker */}
          <input
            type="date"
            value={task.dueDate || ""}
            onChange={(e) => updateTaskDate(task.id, e.target.value)}
            className={`mt-2 px-2 py-1 text-xs backdrop-blur-sm border rounded-lg focus:outline-none focus:ring-1 ${
              darkMode
                ? "bg-[#1A1A2E]/50 border-[#4A4A6A] text-[#6B6B9A] focus:ring-[#6B6B9A]"
                : "bg-white/50 border-[#E8E8F2] text-[#9B9BC8] focus:ring-[#9B9BC8]"
            }`}
          />

          {task.dueDate && (
            <p className={`text-xs mt-1 ${darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}`}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={() => deleteTask(task.id)}
          className={`opacity-0 group-hover:opacity-100 transition-opacity ${
            darkMode ? "text-[#2A2A45] hover:text-[#4A4A6A]" : "text-[#E8E8F2] hover:text-[#C5C5E0]"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function NewListPage() {
  const [mode, setMode] = useState<"edit" | "preview" | "timeline">("edit");
  const [darkMode, setDarkMode] = useState(true);
  const [list, setList] = useState<ListTemplate>({
    title: "",
    description: "",
    tasks: [],
    tags: [],
    public: false,
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [tagInput, setTagInput] = useState("");

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      status: "pending",
      priority: "medium",
    };

    setList({ ...list, tasks: [...list.tasks, newTask] });
    setNewTaskTitle("");
  };

  const deleteTask = (taskId: string) => {
    setList({ ...list, tasks: list.tasks.filter((t) => t.id !== taskId) });
  };

  const toggleTaskStatus = (taskId: string) => {
    setList({
      ...list,
      tasks: list.tasks.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === "complete" ? "pending" : "complete" }
          : t
      ),
    });
  };

  const updateTaskTitle = (taskId: string, newTitle: string) => {
    setList({
      ...list,
      tasks: list.tasks.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t)),
    });
  };

  const moveTask = (index: number, direction: "up" | "down") => {
    const newTasks = [...list.tasks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newTasks.length) return;

    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    setList({ ...list, tasks: newTasks });
  };

  const addTag = () => {
    if (!tagInput.trim() || list.tags.includes(tagInput.trim())) return;
    setList({ ...list, tags: [...list.tags, tagInput.trim()] });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setList({ ...list, tags: list.tags.filter((t) => t !== tag) });
  };

  const handleSave = () => {
    console.log("Saving list:", list);
    alert("Your specters have been captured...");
  };

  const updateTaskPriority = (taskId: string, newPriority: "high" | "medium" | "low") => {
    setList({
      ...list,
      tasks: list.tasks.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t)),
    });
  };

  const updateTaskDate = (taskId: string, newDate: string) => {
    setList({
      ...list,
      tasks: list.tasks.map((t) => (t.id === taskId ? { ...t, dueDate: newDate } : t)),
    });
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragStart = (event: any) => {
    console.log("✨ Drag started!", { activeId: event.active.id });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("🎯 Drag ended!", { activeId: active.id, overId: over?.id, mode });

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a priority column (Timeline mode)
    if (overId === "high" || overId === "medium" || overId === "low") {
      updateTaskPriority(activeId, overId);
      return;
    }

    // Check if dropped on another task in Timeline mode
    const overTask = list.tasks.find((t) => t.id === overId);
    if (overTask && mode === "timeline") {
      updateTaskPriority(activeId, overTask.priority);
      return;
    }

    // Handle reordering in Preview/Manifest mode
    if (activeId !== overId && mode === "preview") {
      const oldIndex = list.tasks.findIndex((t) => t.id === activeId);
      const newIndex = list.tasks.findIndex((t) => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove(list.tasks, oldIndex, newIndex);
        setList({ ...list, tasks: newTasks });
      }
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      darkMode
        ? "bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#2A2A45]"
        : "bg-gradient-to-br from-[#FAFAFF] via-[#F4F4F9] to-[#E8E8F2]"
    }`}>
      {/* Custom Styles */}
      <style jsx global>{`
        /* Drag handles */
        .cursor-grab {
          cursor: grab;
          touch-action: none;
          user-select: none;
        }

        .cursor-grab:active,
        .active\:cursor-grabbing:active {
          cursor: grabbing;
        }

        /* Prevent text selection during drag */
        [data-dnd-draggable] {
          touch-action: none;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 40px); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, 20px); }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        /* Plus Jakarta Sans - modern and refined */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      {/* Ethereal background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {darkMode ? (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4A4A6A] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#6B6B9A] rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-float-delayed"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#8B8BB8] rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-float-slow"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E0E0F5] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#C5C5E0] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#9B9BC8] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-slow"></div>
          </>
        )}
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-md z-50 transition-all duration-500 ${
        darkMode
          ? "bg-[#1A1A2E]/60 border-b border-[#2A2A45]/50"
          : "bg-white/40 border-b border-[#E8E8F2]/50"
      }`}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center border shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-400 ${
                darkMode
                  ? "bg-gradient-to-br from-[#2A2A45]/80 to-[#4A4A6A]/60 border-[#4A4A6A]"
                  : "bg-gradient-to-br from-white/80 to-[#E0E0F5]/60 border-[#E8E8F2]"
              }`}>
                <span className={darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"}>👻</span>
              </div>
              <div>
                <span className={`font-semibold text-base tracking-tight block ${darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"}`}>
                  Ghosts
                </span>
                <span className={`text-[10px] tracking-wide uppercase opacity-70 ${darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}`}>
                  What haunts you
                </span>
              </div>
            </Link>
            <span className={darkMode ? "text-[#2A2A45]" : "text-[#E8E8F2]"}>·</span>
            <span className={`text-sm ${darkMode ? "text-[#6B6B9A]" : "text-[#9B9BC8]"}`}>New specter</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 backdrop-blur-sm rounded-full border transition-all duration-400 ${
                darkMode
                  ? "bg-[#2A2A45]/40 border-[#4A4A6A]/50 text-[#8B8BB8] hover:bg-[#2A2A45]/60"
                  : "bg-white/40 border-[#E8E8F2]/50 text-[#7B7BAF] hover:bg-white/60"
              }`}
            >
              {darkMode ? "🌙" : "☀️"}
            </button>

            {/* Mode Toggle */}
            <div className={`flex items-center gap-2 backdrop-blur-sm rounded-full p-1 border ${
              darkMode
                ? "bg-[#2A2A45]/40 border-[#4A4A6A]/50"
                : "bg-white/40 border-[#E8E8F2]/50"
            }`}>
              <button
                onClick={() => setMode("edit")}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-400 ${
                  mode === "edit"
                    ? darkMode
                      ? "bg-[#4A4A6A]/60 text-[#8B8BB8] shadow-sm"
                      : "bg-white/80 text-[#7B7BAF] shadow-sm"
                    : darkMode
                      ? "text-[#4A4A6A] hover:text-[#6B6B9A]"
                      : "text-[#C5C5E0] hover:text-[#9B9BC8]"
                }`}
              >
                Haunt
              </button>
              <button
                onClick={() => setMode("timeline")}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-400 ${
                  mode === "timeline"
                    ? darkMode
                      ? "bg-[#4A4A6A]/60 text-[#8B8BB8] shadow-sm"
                      : "bg-white/80 text-[#7B7BAF] shadow-sm"
                    : darkMode
                      ? "text-[#4A4A6A] hover:text-[#6B6B9A]"
                      : "text-[#C5C5E0] hover:text-[#9B9BC8]"
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`px-5 py-2 rounded-full text-sm transition-all duration-400 ${
                  mode === "preview"
                    ? darkMode
                      ? "bg-[#4A4A6A]/60 text-[#8B8BB8] shadow-sm"
                      : "bg-white/80 text-[#7B7BAF] shadow-sm"
                    : darkMode
                      ? "text-[#4A4A6A] hover:text-[#6B6B9A]"
                      : "text-[#C5C5E0] hover:text-[#9B9BC8]"
                }`}
              >
                Manifest
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={!list.title.trim()}
              className={`px-6 py-2.5 rounded-full text-sm backdrop-blur-sm transition-all duration-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                darkMode
                  ? "bg-gradient-to-br from-[#6B6B9A] to-[#4A4A6A] text-white hover:shadow-lg hover:shadow-[#6B6B9A]/20"
                  : "bg-gradient-to-br from-[#9B9BC8] to-[#7B7BAF] text-white hover:shadow-lg hover:shadow-[#9B9BC8]/20"
              } hover:scale-101`}
            >
              Capture
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-8 relative z-10">
        <div className={mode === "timeline" ? "max-w-7xl mx-auto" : "max-w-4xl mx-auto"}>
          {mode === "timeline" ? (
            /* Timeline Mode - Kanban Board */
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 gap-6">
                {(["high", "medium", "low"] as const).map((priority) => {
                  const priorityTasks = list.tasks.filter((t) => t.priority === priority);
                  const priorityConfig = {
                    high: { label: "High Priority", emoji: "🔥", color: darkMode ? "#8B8BB8" : "#7B7BAF" },
                    medium: { label: "Medium Priority", emoji: "✨", color: darkMode ? "#6B6B9A" : "#9B9BC8" },
                    low: { label: "Low Priority", emoji: "🌙", color: darkMode ? "#4A4A6A" : "#C5C5E0" },
                  };
                  const config = priorityConfig[priority];

                  return (
                    <DroppableColumn key={priority} id={priority} darkMode={darkMode}>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">{config.emoji}</span>
                        <h3 className={`text-sm font-semibold uppercase tracking-wider opacity-70`} style={{ color: config.color }}>
                          {config.label}
                        </h3>
                        <span className={`ml-auto text-xs opacity-50 ${darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}`}>
                          {priorityTasks.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {priorityTasks.length === 0 ? (
                          <div className="text-center py-12 opacity-30">
                            <p className={`text-sm ${darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}`}>
                              Drop tasks here
                            </p>
                          </div>
                        ) : (
                          priorityTasks.map((task) => (
                            <DraggableTask key={task.id} task={task} darkMode={darkMode} updateTaskDate={updateTaskDate} updateTaskTitle={updateTaskTitle} toggleTaskStatus={toggleTaskStatus} deleteTask={deleteTask} />
                          ))
                        )}
                      </div>
                    </DroppableColumn>
                  );
                })}
              </div>
            </DndContext>
          ) : mode === "edit" ? (
            <div className="space-y-6">
              {/* List Metadata */}
              <div className={`backdrop-blur-xl rounded-2xl border p-10 shadow-lg transition-all duration-500 hover:shadow-xl ${
                darkMode
                  ? "bg-[#1A1A2E]/60 border-[#2A2A45]/60 shadow-[#6B6B9A]/5 hover:shadow-[#6B6B9A]/10"
                  : "bg-white/60 border-[#E8E8F2]/60 shadow-[#9B9BC8]/5 hover:shadow-[#9B9BC8]/10"
              }`}>
                <h2 className={`text-lg font-semibold mb-6 tracking-tight uppercase opacity-60 ${darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"}`}>
                  Spectral Details
                </h2>

                {/* Title */}
                <div className="mb-8">
                  <label className={`block text-xs font-medium mb-2 tracking-wider uppercase opacity-70 ${darkMode ? "text-[#6B6B9A]" : "text-[#9B9BC8]"}`}>
                    What haunts you?
                  </label>
                  <input
                    type="text"
                    value={list.title}
                    onChange={(e) => setList({ ...list, title: e.target.value })}
                    placeholder="Name your phantom..."
                    className={`w-full px-4 py-3 backdrop-blur-sm border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all duration-400 ${
                      darkMode
                        ? "bg-[#2A2A45]/50 border-[#4A4A6A] text-[#8B8BB8] placeholder-[#4A4A6A] focus:ring-[#6B6B9A] hover:bg-[#2A2A45]/70"
                        : "bg-white/50 border-[#E8E8F2] text-[#7B7BAF] placeholder-[#C5C5E0] focus:ring-[#9B9BC8] hover:bg-white/70"
                    }`}
                  />
                </div>

                {/* Description */}
                <div className="mb-8">
                  <label className={`block text-xs font-medium mb-2 tracking-wider uppercase opacity-70 ${darkMode ? "text-[#6B6B9A]" : "text-[#9B9BC8]"}`}>
                    Ethereal notes
                  </label>
                  <textarea
                    value={list.description}
                    onChange={(e) => setList({ ...list, description: e.target.value })}
                    placeholder="Whisper your intentions into the void..."
                    rows={3}
                    className={`w-full px-4 py-3 backdrop-blur-sm border rounded-xl text-sm focus:outline-none focus:ring-1 resize-none transition-all duration-400 leading-relaxed ${
                      darkMode
                        ? "bg-[#2A2A45]/50 border-[#4A4A6A] text-[#8B8BB8] placeholder-[#4A4A6A] focus:ring-[#6B6B9A] hover:bg-[#2A2A45]/70"
                        : "bg-white/50 border-[#E8E8F2] text-[#7B7BAF] placeholder-[#C5C5E0] focus:ring-[#9B9BC8] hover:bg-white/70"
                    }`}
                  />
                </div>

                {/* Tags */}
                <div className="mb-8">
                  <label className={`block text-xs font-medium mb-2 tracking-wider uppercase opacity-70 ${darkMode ? "text-[#6B6B9A]" : "text-[#9B9BC8]"}`}>
                    Spirit markers
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Mark your haunting grounds..."
                      className={`flex-1 px-4 py-2.5 text-sm backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-1 transition-all duration-400 ${
                        darkMode
                          ? "bg-[#2A2A45]/50 border-[#4A4A6A] text-[#8B8BB8] placeholder-[#4A4A6A] focus:ring-[#6B6B9A] hover:bg-[#2A2A45]/70"
                          : "bg-white/50 border-[#E8E8F2] text-[#7B7BAF] placeholder-[#C5C5E0] focus:ring-[#9B9BC8] hover:bg-white/70"
                      }`}
                    />
                    <button
                      onClick={addTag}
                      className={`px-5 py-2.5 text-sm backdrop-blur-sm border rounded-xl hover:scale-101 transition-all duration-400 ${
                        darkMode
                          ? "bg-[#2A2A45]/50 text-[#6B6B9A] border-[#4A4A6A] hover:bg-[#2A2A45]/80 hover:text-[#8B8BB8]"
                          : "bg-white/50 text-[#9B9BC8] border-[#E8E8F2] hover:bg-white/80 hover:text-[#7B7BAF]"
                      }`}
                    >
                      Mark
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm text-sm rounded-full border hover:scale-105 transition-all duration-300 ${
                          darkMode
                            ? "bg-gradient-to-br from-[#2A2A45]/70 to-[#4A4A6A]/50 text-[#8B8BB8] border-[#4A4A6A]"
                            : "bg-gradient-to-br from-white/70 to-[#E0E0F5]/50 text-[#7B7BAF] border-[#E8E8F2]"
                        }`}
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className={`transition-colors duration-300 ${
                            darkMode ? "text-[#4A4A6A] hover:text-[#8B8BB8]" : "text-[#C5C5E0] hover:text-[#7B7BAF]"
                          }`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Public Toggle */}
                <div className={`pt-6 border-t ${darkMode ? "border-[#2A2A45]/60" : "border-[#E8E8F2]/60"}`}>
                  <label className="flex items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={list.public}
                      onChange={(e) => setList({ ...list, public: e.target.checked })}
                      className={`w-4 h-4 rounded transition-all duration-300 ${
                        darkMode
                          ? "border-[#4A4A6A] text-[#6B6B9A] focus:ring-[#6B6B9A]"
                          : "border-[#E8E8F2] text-[#9B9BC8] focus:ring-[#9B9BC8]"
                      } focus:ring-offset-0`}
                    />
                    <div>
                      <span className={`text-sm transition-colors duration-300 ${
                        darkMode
                          ? "text-[#8B8BB8] group-hover:text-[#6B6B9A]"
                          : "text-[#7B7BAF] group-hover:text-[#9B9BC8]"
                      }`}>
                        Release into the ether
                      </span>
                      <p className={`text-xs leading-relaxed ${darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}`}>
                        Let other spirits witness your haunting
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tasks */}
              <div className={`backdrop-blur-xl rounded-2xl border p-10 shadow-lg transition-all duration-500 hover:shadow-xl ${
                darkMode
                  ? "bg-[#1A1A2E]/60 border-[#2A2A45]/60 shadow-[#6B6B9A]/5 hover:shadow-[#6B6B9A]/10"
                  : "bg-white/60 border-[#E8E8F2]/60 shadow-[#9B9BC8]/5 hover:shadow-[#9B9BC8]/10"
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-lg font-semibold tracking-tight uppercase opacity-60 ${darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"}`}>
                    Unfinished business
                  </h2>
                  {list.tasks.length > 0 && (
                    <span className={`text-xs opacity-50 ${darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}`}>
                      {list.tasks.filter(t => t.status === "pending").length} specters lingering
                    </span>
                  )}
                </div>

                {/* Task List */}
                <div className="space-y-3 mb-8">
                  {list.tasks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4 opacity-20">👻</div>
                      <p className={darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}>The void awaits</p>
                      <p className={`text-sm mt-1 ${darkMode ? "text-[#2A2A45]" : "text-[#E8E8F2]"}`}>
                        Summon your first specter below
                      </p>
                    </div>
                  ) : (
                    list.tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`group flex items-center gap-4 p-4 backdrop-blur-sm rounded-xl border transition-all duration-400 ${
                          task.status === "complete" ? "opacity-40 blur-[0.3px]" : ""
                        } ${
                          darkMode
                            ? "bg-[#2A2A45]/40 border-[#4A4A6A]/60 hover:bg-[#2A2A45]/60 hover:shadow-md hover:shadow-[#6B6B9A]/5"
                            : "bg-white/40 border-[#E8E8F2]/60 hover:bg-white/60 hover:shadow-md hover:shadow-[#9B9BC8]/5"
                        }`}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={task.status === "complete"}
                          onChange={() => toggleTaskStatus(task.id)}
                          className={`w-4 h-4 rounded transition-all duration-400 ${
                            darkMode
                              ? "border-[#4A4A6A] text-[#6B6B9A] focus:ring-[#6B6B9A]"
                              : "border-[#E8E8F2] text-[#9B9BC8] focus:ring-[#9B9BC8]"
                          } focus:ring-offset-0`}
                        />

                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => moveTask(index, "up")}
                            disabled={index === 0}
                            className={`disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 ${
                              darkMode ? "text-[#4A4A6A] hover:text-[#6B6B9A]" : "text-[#C5C5E0] hover:text-[#9B9BC8]"
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveTask(index, "down")}
                            disabled={index === list.tasks.length - 1}
                            className={`disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 ${
                              darkMode ? "text-[#4A4A6A] hover:text-[#6B6B9A]" : "text-[#C5C5E0] hover:text-[#9B9BC8]"
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>

                        {/* Task input */}
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                          className={`flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none transition-all duration-400 ${
                            task.status === "complete" ? "line-through" : ""
                          } ${darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"}`}
                        />

                        {/* Delete button */}
                        <button
                          onClick={() => deleteTask(task.id)}
                          className={`transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                            darkMode ? "text-[#2A2A45] hover:text-[#4A4A6A]" : "text-[#E8E8F2] hover:text-[#C5C5E0]"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Task Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    placeholder="What haunts you..."
                    className={`flex-1 px-4 py-3 text-sm backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-1 transition-all duration-400 ${
                      darkMode
                        ? "bg-[#2A2A45]/50 border-[#4A4A6A] text-[#8B8BB8] placeholder-[#4A4A6A] focus:ring-[#6B6B9A] hover:bg-[#2A2A45]/70"
                        : "bg-white/50 border-[#E8E8F2] text-[#7B7BAF] placeholder-[#C5C5E0] focus:ring-[#9B9BC8] hover:bg-white/70"
                    }`}
                  />
                  <button
                    onClick={addTask}
                    className={`px-6 py-3 text-sm backdrop-blur-sm border rounded-xl hover:shadow-md hover:scale-101 transition-all duration-400 ${
                      darkMode
                        ? "bg-gradient-to-br from-[#2A2A45]/70 to-[#4A4A6A]/50 text-[#8B8BB8] border-[#4A4A6A] hover:from-[#2A2A45]/90 hover:to-[#4A4A6A]/70"
                        : "bg-gradient-to-br from-white/70 to-[#E0E0F5]/50 text-[#7B7BAF] border-[#E8E8F2] hover:from-white/90 hover:to-[#E0E0F5]/70"
                    }`}
                  >
                    Summon
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className={`backdrop-blur-xl rounded-2xl border p-12 shadow-lg ${
                darkMode
                  ? "bg-[#1A1A2E]/60 border-[#2A2A45]/60 shadow-[#6B6B9A]/5"
                  : "bg-white/60 border-[#E8E8F2]/60 shadow-[#9B9BC8]/5"
              }`}>
                <div className="mb-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className={`text-3xl font-semibold mb-3 tracking-tight ${darkMode ? "text-[#8B8BB8]" : "text-[#7B7BAF]"}`}>
                        {list.title || "Unnamed specter"}
                      </h1>
                      {list.description && (
                        <p className={`leading-relaxed ${darkMode ? "text-[#6B6B9A]" : "text-[#9B9BC8]"}`}>
                          {list.description}
                        </p>
                      )}
                    </div>
                    {list.public && (
                      <span className={`px-4 py-1.5 backdrop-blur-sm text-xs rounded-full border ${
                        darkMode
                          ? "bg-gradient-to-br from-[#2A2A45]/70 to-[#4A4A6A]/50 text-[#8B8BB8] border-[#4A4A6A]"
                          : "bg-gradient-to-br from-white/70 to-[#E0E0F5]/50 text-[#7B7BAF] border-[#E8E8F2]"
                      }`}>
                        Manifested
                      </span>
                    )}
                  </div>

                  {list.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {list.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1.5 backdrop-blur-sm text-sm rounded-full border ${
                            darkMode
                              ? "bg-gradient-to-br from-[#2A2A45]/70 to-[#4A4A6A]/50 text-[#8B8BB8] border-[#4A4A6A]"
                              : "bg-gradient-to-br from-white/70 to-[#E0E0F5]/50 text-[#7B7BAF] border-[#E8E8F2]"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <SortableContext items={list.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {list.tasks.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4 opacity-20">👻</div>
                        <p className={darkMode ? "text-[#4A4A6A]" : "text-[#C5C5E0]"}>No specters to show</p>
                      </div>
                    ) : (
                      list.tasks.map((task) => (
                        <PreviewDraggableTask key={task.id} task={task} darkMode={darkMode} />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            </DndContext>
          )}
        </div>
      </main>
    </div>
  );
}
