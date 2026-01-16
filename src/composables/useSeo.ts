import { watchEffect } from "vue";

const ensureMeta = (name: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  return tag;
};

export const useSeo = (
  title: () => string,
  description: () => string,
  locale: () => string,
) => {
  watchEffect(() => {
    document.title = title();
    document.documentElement.lang = locale();
    const meta = ensureMeta("description");
    meta.setAttribute("content", description());
  });
};
