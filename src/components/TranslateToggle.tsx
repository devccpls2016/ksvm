import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

let scriptLoaded = false;

function loadScript() {
  if (scriptLoaded) return;
  scriptLoaded = true;
  window.googleTranslateElementInit = () => {
    // eslint-disable-next-line new-cap
    new window.google.translate.TranslateElement(
      { pageLanguage: "mr", includedLanguages: "en,mr", autoDisplay: false },
      "google_translate_element"
    );
  };
  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}

function setLang(lang: "en" | "mr") {
  const tryFire = (attempt = 0) => {
    const sel = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
    if (!sel) {
      if (attempt < 40) setTimeout(() => tryFire(attempt + 1), 200);
      return;
    }
    sel.value = lang;
    sel.dispatchEvent(new Event("change"));
    if (lang === "mr") {
      // Clear google translate cookie so page returns to original
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${location.hostname}`;
    }
  };
  tryFire();
}

export function TranslateToggle() {
  const [lang, setLangState] = useState<"mr" | "en">("mr");

  useEffect(() => {
    loadScript();
    // Hide the default banner Google injects
    const style = document.createElement("style");
    style.textContent = `
      .goog-te-banner-frame, .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      #google_translate_element { display: none !important; }
      font[style*="background-color"] { background: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  const toggle = () => {
    const next = lang === "mr" ? "en" : "mr";
    setLangState(next);
    setLang(next);
  };

  return (
    <>
      <div id="google_translate_element" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggle}
        className="notranslate gap-1"
        translate="no"
      >
        <Languages className="h-4 w-4" />
        {lang === "mr" ? "English" : "मराठी"}
      </Button>
    </>
  );
}
