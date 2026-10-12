const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');
const scene = document.querySelector('#faceScene');
const portrait = document.querySelector('#portraitWrap');

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;


window.addEventListener('pointermove', (event) => {
  targetX = event.clientX;
  targetY = event.clientY;

  cursorDot.style.left = `${targetX}px`;
  cursorDot.style.top = `${targetY}px`;

  if (!scene) return;
  const rect = scene.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;

  if (rect.top < event.clientY && event.clientY < rect.bottom) {
    scene.style.setProperty('--portrait-x', `${x * 22}px`);
    scene.style.setProperty('--portrait-y', `${y * 16}px`);
    scene.style.setProperty('--portrait-r', `${x * 1.5}deg`);
    document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
  }
});

function animateCursor() {
  currentX += (targetX - currentX) * 0.18;
  currentY += (targetY - currentY) * 0.18;
  cursor.style.left = `${currentX}px`;
  cursor.style.top = `${currentY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.addEventListener('pointerover', (event) => {
  if (event.target.closest('a, button')) cursor.classList.add('is-hover');
});
document.addEventListener('pointerout', (event) => {
  if (!event.relatedTarget || !event.relatedTarget.closest?.('a, button')) cursor.classList.remove('is-hover');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));




document.addEventListener("DOMContentLoaded", () => {

  const campaignProjects =
    document.querySelectorAll(
      "#campaigns .campaign-project"
    );

  const dashboard =
    document.getElementById("campaignDashboard");

  if (!dashboard) return;   // legacy dashboard no longer on the page

  const closeButton =
    document.getElementById("dashboardClose");

  const dashboardPages =
    document.querySelectorAll(
      "#campaigns .dashboard-page"
    );

  const dashboardTabs =
    document.querySelectorAll(
      "#campaigns .dashboard-project"
    );

  const channelTabs =
    document.querySelectorAll(
      "#campaigns .channel-tab"
    );

  const channelPages =
    document.querySelectorAll(
      "#campaigns .channel-page"
    );


  /* OPEN PROJECT */

  campaignProjects.forEach(button => {

    button.addEventListener("click", () => {

      const project =
        button.dataset.project;

      dashboard.classList.add("active");

      dashboardPages.forEach(page => {
        page.classList.toggle(
          "active",
          page.dataset.dashboard === project
        );
      });

      dashboardTabs.forEach(tab => {
        tab.classList.toggle(
          "active",
          tab.dataset.projectTab === project
        );
      });

      dashboard.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


  /* TOP PROJECT NAV */

  dashboardTabs.forEach(tab => {

    tab.addEventListener("click", () => {

      const project =
        tab.dataset.projectTab;

      dashboardPages.forEach(page => {
        page.classList.toggle(
          "active",
          page.dataset.dashboard === project
        );
      });

      dashboardTabs.forEach(item => {
        item.classList.toggle(
          "active",
          item === tab
        );
      });

    });

  });


  /* META / GOOGLE */

  channelTabs.forEach(tab => {

    tab.addEventListener("click", () => {

      const channel =
        tab.dataset.channel;

      const currentDashboard =
        tab.closest(".dashboard-page");

      if (!currentDashboard) return;

      currentDashboard
        .querySelectorAll(".channel-tab")
        .forEach(item => {
          item.classList.toggle(
            "active",
            item === tab
          );
        });

      currentDashboard
        .querySelectorAll(".channel-page")
        .forEach(page => {
          page.classList.toggle(
            "active",
            page.dataset.channelPage === channel
          );
        });

    });

  });


  /* CLOSE DASHBOARD */

  closeButton.addEventListener("click", () => {

    dashboard.classList.remove("active");

    dashboard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    dashboard
      .querySelectorAll("video")
      .forEach(video => {
        video.pause();
      });

  });


  /* ONLY ONE VIDEO AT A TIME */

  document
    .querySelectorAll("#campaigns video")
    .forEach(video => {

      video.addEventListener("play", () => {

        document
          .querySelectorAll("#campaigns video")
          .forEach(other => {

            if (other !== video) {
              other.pause();
            }

          });

      });

    });

});



