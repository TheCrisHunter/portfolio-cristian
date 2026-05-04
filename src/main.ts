import "./styles/main.scss";

const getById = <T extends HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

let scrollAnimationToken = 0;

const heroTitles = [
  ["console.log", "'-.-'", ""],
  ["Error 404", "idea", "not found."],
  ["500", "Internal", "Server Error"],
  ["git commit", "-m", "'works'"],
  ["npm run", "build", ""],
  ["merge", "conflict", "resolved."],
  ["debugger;", "mode", ""],
  ["deploy", "green", "check."],
  ["async", "await", ""],
  ["null", "no es", "undefined"],
  ["localhost", "===", "127.0.0.1"],
  ["PR", "review", "approved."],
  ["git push", "--force", "--with-lease"],
  ["HTTP", "200", "OK"],
  ["try", "catch", "finally"],
  ["npm", "install", "again"],
  ["Promise", "pending", "..."],
  ["return", "false;", ""],
];

function initRandomHeroTitle(): void {
  const title = getById<HTMLHeadingElement>("heroTitle");

  if (!title) {
    return;
  }

  const lines = title.querySelectorAll<HTMLElement>("[data-hero-line]");
  const nextTitle = heroTitles[Math.floor(Math.random() * heroTitles.length)];

  lines.forEach((line, index) => {
    line.innerHTML = nextTitle[index] ?? "";
  });
}

function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function animateScrollTo(targetY: number, duration: number, hash: string): void {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();
  const token = ++scrollAnimationToken;

  const step = (currentTime: number): void => {
    if (token !== scrollAnimationToken) {
      return;
    }

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    if (window.location.hash !== hash) {
      history.pushState(null, "", hash);
    }
  };

  requestAnimationFrame(step);
}

function initCursor(): void {
  const cursor = getById<HTMLDivElement>("cursor");
  const ring = getById<HTMLDivElement>("cursorRing");

  if (!cursor || !ring) {
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  document.addEventListener("mousemove", (event: MouseEvent) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const animateCursor = (): void => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(animateCursor);
  };

  animateCursor();

  document
    .querySelectorAll<HTMLElement>("a, button, .project-card, .skill-tag")
    .forEach((element) => {
      element.addEventListener("mouseenter", () => {
        cursor.classList.add("expand");
        ring.classList.add("expand");
      });

      element.addEventListener("mouseleave", () => {
        cursor.classList.remove("expand");
        ring.classList.remove("expand");
      });
    });
}

function initNavbar(): void {
  const navbar = getById<HTMLElement>("navbar");

  if (!navbar) {
    return;
  }

  const updateNavbar = (): void => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  };

  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });
}

function initMobileMenu(): void {
  const hamburger = getById<HTMLButtonElement>("hamburger");
  const mobileMenu = getById<HTMLDivElement>("mobileMenu");
  const mobileClose = getById<HTMLButtonElement>("mobileClose");

  if (!hamburger || !mobileMenu || !mobileClose) {
    return;
  }

  const setMenuState = (isOpen: boolean): void => {
    mobileMenu.classList.toggle("open", isOpen);
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);

    if (isOpen) {
      mobileClose.focus();
      return;
    }

    hamburger.focus();
  };

  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.contains("open");
    setMenuState(!isOpen);
  });

  mobileClose.addEventListener("click", () => setMenuState(false));

  document.querySelectorAll<HTMLAnchorElement>(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  mobileMenu.addEventListener("click", (event: MouseEvent) => {
    if (event.target === mobileMenu) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && mobileMenu.classList.contains("open")) {
      setMenuState(false);
    }
  });
}

function initReveal(): void {
  const revealElements = document.querySelectorAll<HTMLElement>(".reveal");

  if (!revealElements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function initProjectGlow(): void {
  document.querySelectorAll<HTMLElement>(".project-card").forEach((card) => {
    card.addEventListener("mousemove", (event: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (((event.clientX - rect.left) / rect.width) * 100).toFixed(1);
      const y = (((event.clientY - rect.top) / rect.height) * 100).toFixed(1);

      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });
  });
}

type ProjectDetail = {
  badge: string;
  title: string;
  image: string;
  imageAlt: string;
  description: string;
  stack: string[];
  details: string[];
};

const projectDetails: Record<string, ProjectDetail> = {
  baleares: {
    badge: "App Web - Producto",
    title: "Emergencias 112 Islas Baleares",
    image: "/project-media/baleares-112.jpg",
    imageAlt: "Logo de Emergencias 112 Baleares",
    description:
      "Aplicación web para la gestión de emergencias de las Islas Baleares. Permite a los operadores gestionar llamadas de emergencia, asignar recursos y coordinar equipos en tiempo real. Incluye integración con sistemas de geolocalización para optimizar rutas de respuesta y mejorar la eficiencia en la atención de emergencias.",
    stack: ["React", "HxGn OnCall", "Java", "SQL"],
    details: [
      "Paneles de control para supervisores y seguimiento operativo.",
      "Asignación y coordinación de recursos en escenarios críticos.",
      "Generación de informes detallados sobre las operaciones.",
    ],
  },
  policia: {
    badge: "App Web",
    title: "Policía Municipal de Madrid",
    image: "/project-media/policia_municipal.jpg",
    imageAlt: "Logo de Policía Municipal de Madrid",
    description:
      "Aplicación interna para la gestión de recursos humanos de la Policía Municipal de Madrid. Permite a los agentes consultar sus datos personales, gestionar sus turnos y solicitar permisos. Para los gestores del servicio, facilita la gestión de turnos, informes, incidencias y recursos operativos.",
    stack: ["Angular", "TypeScript", "Figma", "Git"],
    details: [
      "Gestión de agentes, turnos, permisos y asignaciones.",
      "Administración de vehículos, material e incidencias internas.",
      "Interfaz pensada para flujos administrativos recurrentes.",
    ],
  },
  ser: {
    badge: "App Web",
    title: "Servicio de Estacionamiento Regulado de Madrid",
    image: "/project-media/madrid-logo.jpg",
    imageAlt: "Logo de Madrid",
    description:
      "Herramienta interna y externa para gestionar el Servicio de Estacionamiento Regulado de Madrid. Permite a los usuarios comprar autorizaciones mensuales o anuales, consultarlas y renovarlas. Para los gestores del servicio, centraliza la gestión de autorizaciones, informes e incidencias.",
    stack: ["Java", "JavaScript", "SQL", "SOAP & REST Web Services"],
    details: [
      "Consulta, compra y renovación de autorizaciones.",
      "Gestión administrativa para operadores y gestores del servicio.",
      "Integración con servicios SOAP y REST para procesos internos.",
    ],
  },
  pockety: {
    badge: "App móvil",
    title: "Pockety",
    image: "/project-media/pockety-logo.svg",
    imageAlt: "Logo de Pockety",
    description:
      "Aplicación móvil para gestionar finanzas personales, con autenticación con dos factores, integración con bancos y panel de analíticas. Incluye sincronización con base de datos en tiempo real para mantener transacciones y balances actualizados al instante.",
    stack: ["Java", "Firebase", "Android Studio"],
    details: [
      "Sincronización de transacciones y balances en tiempo real.",
      "Autenticación reforzada con dos factores.",
      "Panel de analíticas para visualizar hábitos financieros.",
    ],
  },
};

function initProjectModal(): void {
  const modal = getById<HTMLDivElement>("projectModal");
  const closeButton = getById<HTMLButtonElement>("projectModalClose");
  const image = getById<HTMLImageElement>("projectModalImage");
  const media = image?.closest<HTMLDivElement>(".project-modal__media") ?? null;
  const badge = getById<HTMLSpanElement>("projectModalBadge");
  const title = getById<HTMLHeadingElement>("projectModalTitle");
  const description = getById<HTMLParagraphElement>("projectModalDescription");
  const stack = getById<HTMLDivElement>("projectModalStack");
  const details = getById<HTMLUListElement>("projectModalDetails");
  const openButtons =
    document.querySelectorAll<HTMLButtonElement>("[data-project-open]");

  if (
    !modal ||
    !closeButton ||
    !image ||
    !media ||
    !badge ||
    !title ||
    !description ||
    !stack ||
    !details ||
    !openButtons.length
  ) {
    return;
  }

  let lastFocusedButton: HTMLButtonElement | null = null;

  const setModalState = (isOpen: boolean): void => {
    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      requestAnimationFrame(() => closeButton.focus());
      return;
    }

    lastFocusedButton?.focus();
  };

  const renderProject = (project: ProjectDetail): void => {
    image.onerror = () => {
      image.onerror = null;
      image.src = project.image;
    };
    image.src = project.image;
    image.alt = project.imageAlt;
    media.classList.toggle(
      "project-modal__media--pockety",
      project.title === "Pockety",
    );
    badge.textContent = project.badge;
    title.textContent = project.title;
    description.textContent = project.description;
    stack.replaceChildren();
    details.replaceChildren();

    project.stack.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "stack-chip";
      chip.textContent = item;
      stack.append(chip);
    });

    project.details.forEach((item) => {
      const detail = document.createElement("li");
      detail.textContent = item;
      details.append(detail);
    });
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.dataset.projectOpen;

      if (!projectId || !projectDetails[projectId]) {
        return;
      }

      lastFocusedButton = button;
      renderProject(projectDetails[projectId]);
      setModalState(true);
    });
  });

  closeButton.addEventListener("click", () => setModalState(false));

  modal.querySelectorAll<HTMLElement>("[data-project-close]").forEach((element) => {
    element.addEventListener("click", () => setModalState(false));
  });

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      setModalState(false);
    }
  });
}

function initContactModal(): void {
  const openButton = getById<HTMLButtonElement>("contactModalOpen");
  const modal = getById<HTMLDivElement>("contactModal");
  const closeButton = getById<HTMLButtonElement>("contactModalClose");
  const form = getById<HTMLFormElement>("contactForm");
  const emailInput = getById<HTMLInputElement>("contactEmail");
  const submitButton = getById<HTMLButtonElement>("contactSubmit");
  const status = getById<HTMLParagraphElement>("contactStatus");

  if (
    !openButton ||
    !modal ||
    !closeButton ||
    !form ||
    !emailInput ||
    !submitButton ||
    !status
  ) {
    return;
  }

  const setModalState = (isOpen: boolean): void => {
    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);

    if (isOpen) {
      status.textContent = "";
      requestAnimationFrame(() => emailInput.focus());
      return;
    }

    openButton.focus();
  };

  openButton.addEventListener("click", () => setModalState(true));
  closeButton.addEventListener("click", () => setModalState(false));

  modal.querySelectorAll<HTMLElement>("[data-modal-close]").forEach((element) => {
    element.addEventListener("click", () => setModalState(false));
  });

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      setModalState(false);
    }
  });

  form.addEventListener("submit", async (event: SubmitEvent) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const contactEmail = String(formData.get("contactEmail") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const website = String(formData.get("website") ?? "").trim();

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";
    status.textContent = "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactEmail, subject, message, website }),
      });
      const data = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.message ?? "No se ha podido enviar el mensaje.");
      }

      status.textContent = data?.message ?? "Mensaje enviado.";
      form.reset();

      window.setTimeout(() => setModalState(false), 900);
    } catch (error) {
      status.textContent =
        error instanceof Error
          ? error.message
          : "No se ha podido enviar el mensaje.";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar mensaje";
    }
  });
}

function initSmoothScroll(): void {
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not([href="#"])')
    .forEach((link) => {
      link.addEventListener("click", (event: MouseEvent) => {
        const hash = link.getAttribute("href");

        if (!hash) {
          return;
        }

        const targetId = hash.slice(1);
        const target = getById<HTMLElement>(targetId);

        if (!target) {
          return;
        }

        event.preventDefault();

        const navbar = getById<HTMLElement>("navbar");
        const navbarOffset = navbar ? navbar.offsetHeight + 16 : 16;
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        const maxScrollTop =
          document.documentElement.scrollHeight - window.innerHeight;
        const nextScrollTop = Math.min(
          Math.max(0, targetTop - navbarOffset),
          maxScrollTop
        );

        const distance = Math.abs(nextScrollTop - window.scrollY);
        const duration = Math.min(1100, Math.max(550, distance * 0.6));

        animateScrollTo(nextScrollTop, duration, hash);
      });
    });
}

initRandomHeroTitle();
initCursor();
initNavbar();
initMobileMenu();
initSmoothScroll();
initReveal();
initProjectGlow();
initProjectModal();
initContactModal();
