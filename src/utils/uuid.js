export function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem("akvo-visitor-id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("akvo-visitor-id", visitorId);
  }
  return visitorId;
}
