import { useSyncExternalStore } from 'react';
import { subscribe, getRole, getDocuments, getEvidenceUpdates, getTaxonomy, getEvents, getCurrentUser, getUsers, getAISettings, getChatSessions } from '../store';

export function useRole() {
  return useSyncExternalStore(subscribe, getRole);
}

export function useCurrentUser() {
  return useSyncExternalStore(subscribe, getCurrentUser);
}

export function useDocuments() {
  return useSyncExternalStore(subscribe, getDocuments);
}

export function useEvidenceUpdates() {
  return useSyncExternalStore(subscribe, getEvidenceUpdates);
}

export function useTaxonomy() {
  return useSyncExternalStore(subscribe, getTaxonomy);
}

export function useEvents() {
  return useSyncExternalStore(subscribe, getEvents);
}

export function useUsers() {
  return useSyncExternalStore(subscribe, getUsers);
}

export function useAISettings() {
  return useSyncExternalStore(subscribe, getAISettings);
}

export function useChatSessions() {
  return useSyncExternalStore(subscribe, getChatSessions);
}
