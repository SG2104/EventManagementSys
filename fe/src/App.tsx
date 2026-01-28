import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { categoriesApi, eventsApi } from "./services/api";
import type { Event, Category } from "./services/api";
import { EventItem } from "./components/EventCards";
import { EventModal } from "./components/EventModal";
import { Pagination } from "./components/pagination";
import { CategoryFilter } from "./components/CategoryFilters";
import { PageHeader } from "./components/PageHeader";

let categoriesCache: Category[] | null = null;

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<string[]>([]);

  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const eventsRes = await eventsApi.fetchEvents(5, offset, selectedCategoryFilters);
      setEvents(eventsRes.events);
      setTotal(eventsRes.pagination.total);
    } catch (e) {
      console.error(e);
      setError("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [offset, selectedCategoryFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      if (categoriesCache) {
        setCategories(categoriesCache);
        return;
      }
      try {
        const res = await categoriesApi.fetchCategories();
        if (!cancelled) {
          categoriesCache = res.data;
          setCategories(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCategories();
    return () => { cancelled = true; };
  }, []);

  const handleCategoryFilter = (id: string) => {
    setOffset(0);
    setSelectedCategoryFilters((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedCategoryFilters([]);
    setOffset(0);
  };

  const handleCreate = () => {
    setEventToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEventToEdit(null);
  };

  const handleModalSuccess = async () => {
    setSuccessMessage(eventToEdit ? "Event updated successfully." : "Event created successfully.");
    await loadData();
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      setIsDeleting(true);
      await eventsApi.deleteEvent(id);
      setSuccessMessage("Event deleted successfully.");
      await loadData();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setError("Failed to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className=" max-w-5xl mx-auto my-10 p-6 rounded-3xl bg-slate-950 shadow-2xl border border-slate-800 text-slate-100">

      <PageHeader
        totalEvents={total}
        onNewEvent={handleCreate}
        disabled={isLoading || isDeleting}
      />

      {successMessage && <div>{successMessage}</div>}
      {error && <div>{error}</div>}

      <main className=" grid gap-5">

        <CategoryFilter
          categories={categories}
          selectedIds={selectedCategoryFilters}
          onToggle={handleCategoryFilter}
          onClear={clearFilters}
        />

        <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">

          <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
            {events.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                onDelete={handleDelete}
                isSubmitting={isDeleting}
                onEdit={handleEdit}
              />
            ))}
          </ul>

          <Pagination
            offset={offset}
            limit={5}
            total={total}
            onPageChange={setOffset}
          />
        </section>
      </main>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        categories={categories}
        eventToEdit={eventToEdit}
      />
    </div>
  );
}

export default App;