// ==========================================
// Blockspace Forum — Main JS
// ==========================================

const BASE = document.body.dataset.base || '';

// ---- SVG Icons ---- //

const ICONS = {
  twitter: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  github: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
  youtube: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>',
};

const LABELS = {
  twitter: 'X',
  github: 'GitHub',
  youtube: 'YouTube',
};

// ---- Helper: build social icon links ---- //

function buildSocialHtml() {
  let html = '';
  ['twitter', 'github', 'youtube'].forEach(key => {
    const url = SITE_CONFIG.links[key];
    if (url) {
      html += '<a href="' + url + '" target="_blank" rel="noopener" class="social-icon" aria-label="' + (LABELS[key] || key) + '">' + ICONS[key] + '</a>';
    }
  });
  return html;
}

// ---- YouTube Lazy Embed ---- //

function youtubeLazyHtml(url, title) {
  var match = url.match(/embed\/([^?&#]+)/);
  var id = match ? match[1] : '';
  if (!id) {
    return '<iframe src="' + url + '" title="' + title + '" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  }
  return '<div class="video-embed video-embed--lazy" data-video-id="' + id + '" data-title="' + title + '"><div class="video-thumb" style="background-image:url(https://img.youtube.com/vi/' + id + '/sddefault.jpg)"><div class="video-play-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div></div></div>';
}

// Global click handler for lazy YouTube embeds
document.addEventListener('click', function(e) {
  var thumb = e.target.closest('.video-embed--lazy');
  if (!thumb) return;
  var id = thumb.dataset.videoId;
  var title = thumb.dataset.title;
  if (!id) return;
  var parent = thumb.parentNode;
  parent.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0" title="' + title + '" width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
});

// ---- Nav ---- //

function renderNav() {
  const el = document.getElementById('site-nav');
  if (!el) return;

  const socialHtml = buildSocialHtml();
  const isHome = !BASE || window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
  const prefix = isHome ? '' : BASE;

  el.innerHTML =
    '<div class="container container--wide">' +
      '<a href="' + BASE + 'index.html" class="nav-brand">' +
        '<img src="' + BASE + 'assets/logo.jpg" alt="' + SITE_CONFIG.name + '">' +
        '<span>' + SITE_CONFIG.name + ' <span class="nav-tagline">| The Ticker Is ETH</span></span>' +
      '</a>' +
      '<button class="nav-hamburger" aria-label="Toggle menu" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
      '<div class="nav-right">' +
        '<ul class="nav-links">' +
          '<li><a href="' + prefix + 'index.html">Home</a></li>' +
          '<li><a href="' + prefix + 'learn.html">Learn</a></li>' +
          '<li><a href="' + prefix + 'research.html">Research</a></li>' +
          '<li><a href="' + prefix + 'index.html#tooling">Tooling</a></li>' +
          '<li><a href="' + prefix + 'events.html">Events</a></li>' +
        '</ul>' +
        '<div class="nav-socials">' + socialHtml + '</div>' +
      '</div>' +
    '</div>';

  // Hamburger toggle
  var hamburger = el.querySelector('.nav-hamburger');
  var navRight = el.querySelector('.nav-right');
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
      hamburger.classList.toggle('is-active');
      navRight.classList.toggle('is-open');
    });

    // Close menu when a link is clicked
    navRight.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('is-active');
        navRight.classList.remove('is-open');
      });
    });
  }

  var path = window.location.pathname;
  var hash = window.location.hash;
  var activeLink = null;

  // Determine which single nav item should be active
  // Most specific matches first to avoid double-highlighting
  if (hash === '#tooling' && (path.endsWith('/') || path.endsWith('index.html'))) {
    activeLink = 'tooling';
  } else if (path.includes('research')) {
    activeLink = 'research';
  } else if (path.includes('learn/series')) {
    activeLink = 'research';
  } else if (path.includes('events')) {
    activeLink = 'events';
  } else if (path.includes('learn') || path.includes('blog') || path.includes('pbs-')) {
    activeLink = 'learn';
  } else if (path.endsWith('/') || path.endsWith('index.html')) {
    activeLink = 'home';
  }

  if (activeLink) {
    el.querySelectorAll('.nav-links a').forEach(function(a) {
      var href = a.getAttribute('href');
      if (activeLink === 'tooling' && href.includes('#tooling')) {
        a.classList.add('active');
      } else if (activeLink === 'research' && href.includes('research')) {
        a.classList.add('active');
      } else if (activeLink === 'events' && href.includes('events')) {
        a.classList.add('active');
      } else if (activeLink === 'learn' && href.includes('learn') && !href.includes('#')) {
        a.classList.add('active');
      } else if (activeLink === 'home' && (href.endsWith('index.html') || href.endsWith('/')) && !href.includes('#')) {
        a.classList.add('active');
      }
    });
  }

  // Update active state on hash change (e.g. clicking Tooling from Home)
  window.addEventListener('hashchange', function() {
    el.querySelectorAll('.nav-links a.active').forEach(function(a) {
      a.classList.remove('active');
    });
    var newHash = window.location.hash;
    if (newHash === '#tooling') {
      el.querySelectorAll('.nav-links a').forEach(function(a) {
        if (a.getAttribute('href').includes('#tooling')) a.classList.add('active');
      });
    } else if (!newHash) {
      el.querySelectorAll('.nav-links a').forEach(function(a) {
        var href = a.getAttribute('href');
        if ((href.endsWith('index.html') || href.endsWith('/')) && !href.includes('#')) a.classList.add('active');
      });
    }
  });
}

// ---- Footer ---- //

function renderFooter() {
  const el = document.getElementById('site-footer');
  if (!el) return;

  el.innerHTML =
    '<div class="container">' +
      '<div class="footer-bottom">' +
        '<span>' + SITE_CONFIG.name + ' &middot; Open source initiative &middot; <a href="' + BASE + 'disclaimer.html" class="footer-legal">Disclaimer</a></span>' +
        '<div class="footer-socials">' + buildSocialHtml() + '</div>' +
      '</div>' +
    '</div>';
}

// ---- Research List ---- //

function renderResearchList(containerId, featured) {
  const container = document.getElementById(containerId);
  if (!container) return;

  var items = featured ? SITE_CONFIG.research.filter(function(r) { return r.featured; }) : SITE_CONFIG.research;
  items.forEach(function(item) {
    var el;
    if (item.url) {
      el = document.createElement('a');
      el.href = item.url;
      el.target = '_blank';
      el.rel = 'noopener';
      el.className = 'research-card card-link';
    } else {
      el = document.createElement('div');
      el.className = 'research-card card-disabled';
    }

    var html = '<h3>' + item.title + '</h3>' +
      '<p class="card-meta">' + item.date + '</p>' +
      '<p>' + item.summary + '</p>';

    if (item.status) {
      html += '<span class="status-label">' + item.status + '</span>';
    } else if (item.url) {
      html += '<span class="card-arrow">' + ICONS.arrow + '</span>';
    }

    el.innerHTML = html;
    container.appendChild(el);
  });

  // Add "Coming soon" card on full research page
  if (!featured) {
    var soon = document.createElement('div');
    soon.className = 'research-card card-disabled';
    soon.innerHTML = '<h3>More research coming soon</h3>' +
      '<p>We are actively working on new research. Stay tuned.</p>';
    container.appendChild(soon);
  }
}

// ---- Tooling: Operate ---- //

function renderToolingOperate(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  SITE_CONFIG.tooling.operate.forEach(function(tool) {
    var a = document.createElement('a');
    a.href = tool.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'tool-card card-link';
    a.innerHTML = '<h3>' + tool.name + '</h3>' +
      '<p>' + tool.description + '</p>' +
      '<span class="card-arrow">' + ICONS.arrow + '</span>';
    container.appendChild(a);
  });
}

// ---- Tooling: Observe ---- //

function renderToolingObserve(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  SITE_CONFIG.tooling.observe.forEach(function(tool) {
    var a = document.createElement('a');
    a.href = tool.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'observe-card card-link';
    a.innerHTML = '<h3>' + tool.name + '</h3>' +
      '<p>' + tool.description + '</p>' +
      '<span class="card-arrow">' + ICONS.arrow + '</span>';
    container.appendChild(a);
  });
}

// ---- Tooling List (compact) ---- //

function renderToolingList(containerId, items) {
  var container = document.getElementById(containerId);
  if (!container) return;

  items.forEach(function(tool) {
    var li = document.createElement('li');
    li.innerHTML = '<a href="' + tool.url + '" target="_blank" rel="noopener">' +
      tool.name + '<span class="tools-desc"> — ' + tool.description + '</span>' +
      '</a>';
    container.appendChild(li);
  });
}

// ---- Contribute ---- //

function renderContributeList(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  SITE_CONFIG.contribute.forEach(function(repo) {
    var a = document.createElement('a');
    a.href = repo.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'tool-card card-link';
    a.innerHTML = '<h3>' + repo.name + '</h3>' +
      '<span class="lang-badge">' + repo.lang + '</span>' +
      '<p>' + repo.description + '</p>' +
      '<span class="card-arrow">' + ICONS.arrow + '</span>';
    container.appendChild(a);
  });
}

// ---- Events List ---- //

function renderEventsList(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var events = SITE_CONFIG.events.slice().sort(function(a, b) {
    return parseInt(b.year) - parseInt(a.year);
  });

  events.forEach(function(evt) {
    if (evt.videos && evt.videos.length) {
      renderEventSection(container, evt);
    } else {
      renderEventCard(container, evt);
    }
  });
}

function renderEventCard(container, evt) {
  var section = document.createElement('div');
  section.className = 'event-section';

  var header = document.createElement('div');
  header.className = 'event-section-header';
  header.innerHTML = '<span class="event-date">' + evt.year + ' &middot; ' + evt.location + '</span>' +
    '<h2>' + evt.title + '</h2>' +
    '<p>' + (evt.header_description || evt.description) + '</p>';
  section.appendChild(header);

  var article = document.createElement('article');
  article.className = 'event-card';

  var mediaHtml;
  if (evt.video) {
    mediaHtml = '<div class="event-media">' +
      youtubeLazyHtml(evt.video, evt.title) +
      '</div>';
  } else {
    mediaHtml = '<div class="event-media"><div class="event-placeholder event-placeholder-logo">' +
      '<img src="' + BASE + 'assets/logo.jpg" alt="' + evt.title + '" style="max-width: 80px; max-height: 80px; border-radius: 8px; opacity: 0.6;">' +
      '</div></div>';
  }

  var linkAttrs = evt.link && evt.link.indexOf('http') === 0 ? 'href="' + evt.link + '" target="_blank" rel="noopener"' : 'href="' + evt.link + '"';
  var infoHtml = '<div class="event-info">' +
    '<span class="event-date">' + evt.year + ' &middot; ' + evt.location + '</span>' +
    '<h2>' + evt.title + '</h2>' +
    '<p>' + evt.description + '</p>' +
    (evt.status && evt.link ? '<a ' + linkAttrs + ' class="status-label status-link">' + evt.status + ' &rarr;</a>' : '') +
    (evt.status && !evt.link ? '<span class="status-label">' + evt.status + '</span>' : '') +
    '</div>';

  article.innerHTML = mediaHtml + infoHtml;
  section.appendChild(article);
  container.appendChild(section);
}

function renderEventSection(container, evt) {
  var section = document.createElement('div');
  section.className = 'event-section';

  // Header
  var header = document.createElement('div');
  header.className = 'event-section-header';
  header.innerHTML = '<span class="event-date">' + evt.year + ' &middot; ' + evt.location + '</span>' +
    '<h2>' + evt.title + '</h2>' +
    '<p>' + (evt.header_description || evt.description) + '</p>';
  section.appendChild(header);

  // Recap subsection
  var recapSub = document.createElement('div');
  recapSub.className = 'event-subsection';
  recapSub.innerHTML = '<h3>Recap</h3>';

  var recapCard = document.createElement('div');
  recapCard.className = 'event-card';

  var mediaHtml = '<div class="event-media">' +
    youtubeLazyHtml(evt.video, evt.title) +
    '</div>';

  var infoHtml = '<div class="event-info">' +
    '<span class="event-date">' + evt.year + ' &middot; ' + evt.location + '</span>' +
    '<h2>' + evt.title + '</h2>' +
    '<p>' + evt.description + '</p>' +
    (evt.status && evt.link ? '<a href="' + evt.link + '" class="status-label status-link">' + evt.status + ' &rarr;</a>' : '') +
    (evt.status && !evt.link ? '<span class="status-label">' + evt.status + '</span>' : '') +
    '</div>';

  recapCard.innerHTML = mediaHtml + infoHtml;
  recapSub.appendChild(recapCard);
  section.appendChild(recapSub);

  // Talks subsection
  var talksSub = document.createElement('div');
  talksSub.className = 'event-subsection';
  talksSub.id = 'talks';

  var toggleId = 'event-videos-' + evt.year;
  var videosContainer = document.createElement('div');
  videosContainer.id = toggleId;
  videosContainer.className = 'event-videos';

  var talksHeader = document.createElement('h3');
  talksHeader.className = 'event-talks-header';
  talksHeader.innerHTML = 'Talks <span class="caret" aria-hidden="true">&#9662;</span>';
  talksHeader.setAttribute('role', 'button');
  talksHeader.setAttribute('aria-expanded', 'true');
  talksHeader.setAttribute('aria-controls', toggleId);
  talksHeader.style.cursor = 'pointer';

  evt.videos.forEach(function(v) {
    var article = document.createElement('article');
    article.className = 'video-card';

    var vMedia;
    if (v.video) {
      vMedia = '<div class="video-card-media">' +
        youtubeLazyHtml(v.video, v.title) +
        '</div>';
    } else {
      vMedia = '<div class="video-card-media"><div class="event-placeholder event-placeholder-logo">' +
        '<img src="' + BASE + 'assets/logo.jpg" alt="' + v.title + '" style="max-width: 80px; max-height: 80px; border-radius: 8px; opacity: 0.6;">' +
        '</div></div>';
    }

    var vInfo = '<div class="video-card-info">' +
      '<h3>' + v.title + '</h3>' +
      (v.summary ? '<p>' + v.summary + '</p>' : '') +
      '</div>';

    article.innerHTML = vMedia + vInfo;
    videosContainer.appendChild(article);
  });

  talksHeader.addEventListener('click', function() {
    var expanded = talksHeader.getAttribute('aria-expanded') === 'true';
    talksHeader.setAttribute('aria-expanded', !expanded);
    videosContainer.style.display = expanded ? 'none' : 'flex';
    talksHeader.querySelector('.caret').innerHTML = expanded ? '&#9656;' : '&#9662;';
  });

  talksSub.appendChild(talksHeader);
  talksSub.appendChild(videosContainer);
  section.appendChild(talksSub);

  container.appendChild(section);
}

function renderLearnEvents(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  SITE_CONFIG.events.forEach(function(evt) {
    if (!evt.link) return;
    var a = document.createElement('a');
    a.href = evt.link;
    a.className = 'learn-card card-link';
    a.innerHTML = '<span class="learn-level">' + evt.year + '</span>' +
      '<h3>' + evt.title + '</h3>' +
      '<p>' + evt.description + '</p>' +
      '<span class="card-arrow">' + ICONS.arrow + '</span>';
    container.appendChild(a);
  });
}

// ---- Latest Event (single) ---- //

function renderLatestEvent(containerId) {
  var container = document.getElementById(containerId);
  if (!container || !SITE_CONFIG.events.length) return;

  var evt = SITE_CONFIG.events[0];
  var article = document.createElement('article');
  article.className = 'event-card';

  var mediaHtml;
  if (evt.video) {
    mediaHtml = '<div class="event-media">' +
      youtubeLazyHtml(evt.video, evt.title) +
      '</div>';
  } else {
    mediaHtml = '<div class="event-media"><div class="event-placeholder">' +
      '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>' +
      '<line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line>' +
      '<line x1="3" y1="10" x2="21" y2="10"></line></svg>' +
      '</div></div>';
  }

  var infoHtml = '<div class="event-info">' +
    '<span class="event-date">' + evt.year + ' &middot; ' + evt.location + '</span>' +
    '<h2>' + evt.title + '</h2>' +
    '<p>' + evt.description + '</p>' +
    (evt.status && evt.link ? '<a href="' + evt.link + '" class="status-label status-link">' + evt.status + ' &rarr;</a>' : '') +
    (evt.status && !evt.link ? '<span class="status-label">' + evt.status + '</span>' : '') +
    (evt.videos && evt.videos.length ? '<a href="' + BASE + 'events.html#talks" class="status-label status-link">Talks &rarr;</a>' : '') +
    '</div>';

  article.innerHTML = mediaHtml + infoHtml;
  container.appendChild(article);
}

// ---- Post List ---- //

function renderPostList(containerId, limit) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var posts = limit ? SITE_CONFIG.posts.slice(-limit).reverse() : SITE_CONFIG.posts;

  posts.forEach(function(post) {
    var globalIdx = SITE_CONFIG.posts.indexOf(post);
    var num = String(globalIdx + 1).padStart(2, '0');

    var a = document.createElement('a');
    a.href = BASE + 'learn/series/' + post.slug + '.html';
    a.className = 'post-card';
    a.innerHTML =
      '<span class="post-number">' + num + '</span>' +
      '<div class="post-info">' +
        '<div class="post-meta">' + formatDateCompact(post.date) + '</div>' +
        '<h3>' + post.title + '</h3>' +
        '<div class="post-subtitle">' + post.subtitle + '</div>' +
      '</div>';
    container.appendChild(a);
  });
}

// ---- Post Page ---- //

function renderPostNav(currentSlug) {
  var nav = document.getElementById('post-nav');
  if (!nav) return;

  var posts = SITE_CONFIG.posts;
  var idx = posts.findIndex(function(p) { return p.slug === currentSlug; });
  if (idx === -1) return;

  var html = '';

  if (idx > 0) {
    var prev = posts[idx - 1];
    html += '<a href="' + prev.slug + '.html" class="prev"><span class="label">Previous</span>' + prev.title + '</a>';
  }

  if (idx < posts.length - 1) {
    var next = posts[idx + 1];
    html += '<a href="' + next.slug + '.html" class="next"><span class="label">Next</span>' + next.title + '</a>';
  }

  nav.innerHTML = html;
}

function initTableOfContents() {
  var content = document.querySelector('.post-content');
  var header = document.querySelector('.post-header');
  if (!content || !header) return;

  var headings = content.querySelectorAll('h2');
  if (headings.length < 3) return;

  headings.forEach(function(h, i) { h.id = 'section-' + (i + 1); });

  var toc = document.createElement('div');
  toc.className = 'toc';
  toc.innerHTML = '<div class="toc-label">Contents</div>';

  var ol = document.createElement('ol');
  headings.forEach(function(h, i) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#section-' + (i + 1);
    a.textContent = h.textContent;
    li.appendChild(a);
    ol.appendChild(li);
  });

  toc.appendChild(ol);
  content.insertBefore(toc, content.firstChild);
}

function initReadingTime() {
  var content = document.querySelector('.post-content');
  var meta = document.querySelector('.post-header .post-meta');
  if (!content || !meta) return;

  var words = content.textContent.trim().split(/\s+/).length;
  var minutes = Math.max(1, Math.round(words / 230));
  meta.innerHTML += ' &middot; ' + minutes + ' min read';
}

function initProgressBar() {
  var content = document.querySelector('.post-content');
  if (!content) return;

  var bar = document.createElement('div');
  bar.className = 'progress-bar';
  document.body.prepend(bar);

  window.addEventListener('scroll', function() {
    var rect = content.getBoundingClientRect();
    var total = content.offsetHeight;
    var scrolled = Math.max(0, -rect.top);
    var pct = Math.min(100, (scrolled / (total - window.innerHeight * 0.5)) * 100);
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ---- Utilities ---- //

function formatDateCompact(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + String(d.getDate()).padStart(2, '0') + ', ' + d.getFullYear();
}

function formatDate(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ---- Init ---- //

document.addEventListener('DOMContentLoaded', function() {
  renderBanner();
  renderNav();
  renderFooter();
  initTableOfContents();
  initReadingTime();
  initProgressBar();
});


// ---- Smooth scroll with replaceState (no history push for anchors) ---- //

document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href*="#"]');
  if (!link) return;
  var href = link.getAttribute('href');
  // Only handle same-page anchors
  if (href.startsWith('#') || (href.includes('#') && href.split('#')[0] === '' )) {
    var hash = '#' + href.split('#')[1];
    var target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', hash);
    }
  }
});


// ---- Learn Threads (homepage) ---- //

function renderLearnThreads(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var threads = [
    {
      title: "Intro to Blockspace",
      description: "What is blockspace? What is PBS? A progressive path from first principles.",
      items: ["PBS 101: The Basics", "PBS 201: The Pipeline", "PBS 301: The Frontier"],
      url: "learn.html#intro-to-blockspace",
    },
    {
      title: "The Blockspace Forum Series",
      description: "An educational series on Ethereum's transaction journey and structural gaps.",
      items: SITE_CONFIG.posts.slice(-3).reverse().map(function(p) { return p.title; }),
      url: "learn.html#blockspace-forum-series",
    },
  ];

  var grid = document.createElement('div');
  grid.className = 'thread-grid';

  threads.forEach(function(thread) {
    var a = document.createElement('a');
    a.href = thread.url;
    a.className = 'thread-card card-link';
    a.innerHTML = '<h3>' + thread.title + '</h3>' +
      '<p>' + thread.description + '</p>' +
      '<ul class="thread-preview">' +
      thread.items.map(function(item) { return '<li>' + item + '</li>'; }).join('') +
      '</ul>' +
      '<span class="card-arrow">' + ICONS.arrow + '</span>';
    grid.appendChild(a);
  });

  container.appendChild(grid);
}

// ---- Learn Intro (learn page) ---- //

function renderLearnIntro(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var items = [
    { level: "101", title: "The Basics", subtitle: "What is blockspace? What is a builder? What is a relay?", url: "learn/pbs-101.html" },
    { level: "201", title: "The Pipeline", subtitle: "Sidecars. The block auction. Timing games. Proposer agency.", url: "learn/pbs-201.html" },
    { level: "301", title: "The Frontier", subtitle: "ePBS. Preconfirmations. PEPC. Multi-party block construction.", url: "learn/pbs-301.html" },
  ];

  items.forEach(function(item) {
    var a = document.createElement('a');
    a.href = item.url;
    a.className = 'learn-card card-link';
    a.innerHTML = '<span class="learn-level">' + item.level + '</span>' +
      '<h3>' + item.title + '</h3>' +
      '<p>' + item.subtitle + '</p>' +
      '<span class="card-arrow">' + ICONS.arrow + '</span>';
    container.appendChild(a);
  });
}

// ---- Site Banner ---- //

function renderBanner() {
  var banner = SITE_CONFIG.banner;
  if (!banner || !banner.active) return;

  // Dismissal is keyed by banner text so new banners reappear.
  // On the home page we always show the banner (clearing any prior dismissal),
  // so clicking X only hides it until the user navigates back home.
  var dismissKey = 'banner-dismissed:' + banner.text;
  var path = window.location.pathname;
  var isHome = path === '/' || path.endsWith('/index.html') || path.endsWith('/') || path === '';
  if (isHome) {
    sessionStorage.removeItem(dismissKey);
  } else if (sessionStorage.getItem(dismissKey)) {
    return;
  }

  var el = document.createElement('div');
  el.className = 'site-banner';
  el.innerHTML =
    '<div class="container container--wide site-banner-inner">' +
      '<a href="' + BASE + banner.link + '" class="site-banner-link">' +
        '<span class="site-banner-text">' + banner.text + '</span>' +
        '<span class="site-banner-arrow">&rarr;</span>' +
      '</a>' +
      '<button class="site-banner-close" aria-label="Dismiss banner">&times;</button>' +
    '</div>';

  function dismissBanner() {
    el.remove();
    sessionStorage.setItem(dismissKey, '1');
  }

  el.querySelector('.site-banner-close').addEventListener('click', function(e) {
    e.preventDefault();
    dismissBanner();
  });

  el.querySelector('.site-banner-link').addEventListener('click', function() {
    dismissBanner();
  });

  // Insert before everything else in body
  document.body.insertBefore(el, document.body.firstChild);
}
