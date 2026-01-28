import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Category {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  categories: Category[];
}

export interface EventFormData {
  name: string;
  description: string;
  start_date_time: string;
  end_date_time: string;
  categoryIds: string[];
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface EventResponse {
  events: Event[];
  pagination: PaginationMeta;
}

type ApiResponse<T> = {
  status: string;
  data: T;
};


export const eventsApi = {
  async fetchEvents(limit = 10, offset = 0, categoryIds?: string[]) {
    const params: {
      limit: number;
      offset: number;
      categoryIds?: string | undefined;
    } = { limit, offset };

    if (categoryIds?.length) {
      params.categoryIds = categoryIds.join(",");
    }

    try {
      const res = await api.get<ApiResponse<EventResponse>>("/events", {
        params,
      });

      return res.data.data;
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw error;
    }
  },

  async fetchEventById(id: string) {
    try {
      const res = await api.get(`/events/${id}`);
      return res.data;
    } catch (error) {
      console.error(`Failed to fetch event (${id})`, error);
      throw error;
    }
  },

  async createEvent(payload: EventFormData) {
    const res = await api.post("/events", payload);
    return res.data;
  },

  async updateEvent(id: string, payload: EventFormData) {
    const res = await api.patch(`/events/${id}`, payload);
    return res.data;
  },

  async deleteEvent(id: string) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },

  async checkEventOverlap(start: string, end: string, excludeId?: string) {
    try {
      const res = await api.get<{
        data: {
          hasOverlap: boolean;
          conflictingEvents: Event[];
        };
      }>("/events/check-overlap", {
        params: {
          start_date_time: start,
          end_date_time: end,
          excludeEventId: excludeId,
        },
      });

      return res.data.data;
    } catch (error) {
      console.error("Overlap check failed:", error);
      throw error;
    }
  },
};


export const categoriesApi = {
  async fetchCategories() {
    const res = await api.get("/categories");
    return res.data;
  },
};

export default api;
