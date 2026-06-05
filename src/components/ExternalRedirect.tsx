import { useEffect } from "react";

type Props = { url: string };

/** Immediately redirects to an external URL (e.g. empower / miraclebaby subdomains). */
export default function ExternalRedirect({ url }: Props) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return null;
}
