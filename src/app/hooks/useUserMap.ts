export function useUserMap(users: any[]) {
  return users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, { id: string; name: string }>);
}