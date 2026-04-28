#!/usr/bin/env python3
"""
Blockspace Forum — Static Site Builder

Reads markdown files from content/, generates:
  - learn/series/*.html  (one per markdown file)
  - config.js  (post registry auto-generated)
  - index.html    (landing page)
  - blog.html     (post listing)

Usage:
  python3 build.py
  python3 build.py --clean   # remove generated posts first

Requirements:
  pip install markdown pyyaml
"""

import os
import re
import sys
import yaml
import markdown
from pathlib import Path
from datetime import date as date_type

# ---- Configuration ---- #

SITE_DIR = Path(__file__).parent
CONTENT_DIR = SITE_DIR / "content" / "learn" / "series"
POSTS_DIR = SITE_DIR / "learn" / "series"
TEMPLATES_DIR = SITE_DIR / "templates"
LEARN_CONTENT_DIR = SITE_DIR / "content" / "learn"
LEARN_DIR = SITE_DIR / "learn"

# ---- Frontmatter Parser ---- #

def parse_frontmatter(text):
    """Parse YAML frontmatter from markdown text."""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', text, re.DOTALL)
    if not match:
        return {}, text
    meta = yaml.safe_load(match.group(1))
    body = match.group(2)
    return meta, body

# ---- Template Loading ---- #

def load_template(name):
    with open(TEMPLATES_DIR / name, 'r') as f:
        return f.read()

def render_template(template, variables):
    """Simple {{variable}} replacement."""
    result = template
    for key, val in variables.items():
        result = result.replace('{{' + key + '}}', str(val))
    return result

# ---- Post-processing ---- #

def convert_stat_callouts(body):
    """Convert :::stat NUMBER | TEXT ::: syntax to HTML before markdown processing."""
    import re
    def replace_stat(m):
        number = m.group(1).strip()
        text = m.group(2).strip()
        return f'<div class="stat-callout"><div class="stat-number">{number}</div><div class="stat-text">{text}</div></div>'
    
    body = re.sub(r':::stat\s+(.+?)\s*\|\s*(.+?):::', replace_stat, body)
    return body

def add_image_captions(html):
    """Convert <img> followed by Source: text into <figure> with <figcaption>."""
    # Pattern: <p><img ...></p> followed by <p>Source: ...</p>
    html = re.sub(
        r'<p>(<img [^>]+>)</p>\s*<p>(Source:.*?)</p>',
        r'<figure>\1<figcaption>\2</figcaption></figure>',
        html
    )
    # Pattern: <p><img ...></p> followed by <p>Data provided by ...</p>
    html = re.sub(
        r'<p>(<img [^>]+>)</p>\s*<p>(Data provided by.*?)</p>',
        r'<figure>\1<figcaption>\2</figcaption></figure>',
        html
    )
    # Pattern: <p><img ...></p> followed by <p>Caption text that doesn't start a new thought</p>
    # (starts with a name like "Validator distribution", "Bid value", "Burnt ETH", "Expected weekly")
    html = re.sub(
        r'<p>(<img [^>]+>)</p>\s*<p>((?:Validator distribution|Bid value|Burnt ETH|Expected weekly|Source:).*?)</p>',
        r'<figure>\1<figcaption>\2</figcaption></figure>',
        html
    )
    # Pattern: <p><img ...></p> followed by <p><em>caption text</em></p>
    html = re.sub(
        r'<p>(<img [^>]+>)</p>\s*<p><em>(.*?)</em></p>',
        r'<figure>\1<figcaption>\2</figcaption></figure>',
        html
    )
    return html

# ---- Build Posts ---- #

def build_posts():
    """Read all content/*.md, generate posts/*.html, return post metadata list."""
    md_files = sorted(CONTENT_DIR.glob("*.md"))

    if not md_files:
        print("No markdown files found in content/")
        return []

    post_template = load_template("post.html")
    posts_meta = []

    POSTS_DIR.mkdir(parents=True, exist_ok=True)

    for md_file in md_files:
        text = md_file.read_text()
        meta, body = parse_frontmatter(text)

        slug = md_file.stem
        title = meta.get("title", slug)
        subtitle = meta.get("subtitle", "")
        date = str(meta.get("date", ""))
        source = meta.get("source", "")

        # Clean up leading whitespace from each line
        body = '\n'.join(line.strip() for line in body.split('\n'))

        # Convert stat callouts before markdown processing
        body = convert_stat_callouts(body)

        # Convert markdown to HTML
        content_html = markdown.markdown(
            body,
            extensions=['extra', 'smarty'],
            output_format='html5'
        )

        # Post-process: image captions
        content_html = add_image_captions(content_html)

        # Format date for display
        if isinstance(meta.get("date"), date_type):
            display_date = meta["date"].strftime("%B %d, %Y")
        else:
            display_date = date

        # Source link
        source_html = ""
        if source:
            source_html = f' · <a href="{source}" target="_blank" rel="noopener">Original thread</a>'

        # Render
        html = render_template(post_template, {
            "title": title,
            "subtitle": subtitle,
            "date": display_date,
            "source_link": source_html,
            "slug": slug,
            "content": content_html,
            "part": "",
            "base": "../../",
            "site_url": SITE_URL,
        })

        posts_meta.append({
            "slug": slug,
            "title": title,
            "subtitle": subtitle,
            "date": date,
            "source": source,
            "html": html,
        })

    # Sort by date
    posts_meta.sort(key=lambda p: p["date"])

    # Fill in part numbers and write files
    for i, post in enumerate(posts_meta):
        html = post["html"].replace(
            '<span class="part-number"></span>',
            f'Part {i + 1} · '
        )

        out_path = POSTS_DIR / f"{post['slug']}.html"
        out_path.write_text(html)
        print(f"  Built learn/series/{post['slug']}.html")

    return posts_meta

# ---- Build Config ---- #

def build_config(posts_meta):
    """Generate config.js from post metadata and existing link config."""

    # Read banner config
    banner_path = SITE_DIR / "content" / "_banner.yaml"
    banner = {}
    if banner_path.exists():
        banner = yaml.safe_load(banner_path.read_text()) or {}

    existing_links = {}
    config_path = SITE_DIR / "config.js"
    if config_path.exists():
        config_text = config_path.read_text()
        for key in ["twitter", "github", "youtube", "ethresearch", "website", "discord", "telegram"]:
            match = re.search(rf'{key}:\s*"([^"]*)"', config_text)
            if match:
                existing_links[key] = match.group(1)

    posts_js = ",\n".join([
        f'''    {{
      slug: "{p['slug']}",
      title: "{p['title']}",
      subtitle: "{p['subtitle']}",
      date: "{p['date']}",
      source: "{p['source']}",
    }}''' for p in posts_meta
    ])

    links = {
        "twitter": existing_links.get("twitter", "https://x.com/blockspaceforum"),
        "github": existing_links.get("github", "https://github.com/blockspace-forum"),
        "youtube": existing_links.get("youtube", "https://www.youtube.com/@BlockspaceForum"),
        "ethresearch": existing_links.get("ethresearch", ""),
        "website": existing_links.get("website", ""),
        "discord": existing_links.get("discord", ""),
        "telegram": existing_links.get("telegram", ""),
    }

    links_js = "\n".join([f'    {k}: "{v}",' for k, v in links.items()])

    banner_active = "true" if banner.get("active") else "false"
    banner_text = banner.get("text", "")
    banner_link = banner.get("link", "")
    banner_js = f"""  banner: {{
    active: {banner_active},
    text: "{banner_text}",
    link: "{banner_link}",
  }},"""

    config = f"""// ==========================================
// Blockspace Forum — Site Configuration
// ==========================================
// AUTO-GENERATED by build.py from content/*.md
// To update links, edit this file directly.
// To update posts, edit content/*.md and re-run build.py.

const SITE_CONFIG = {{
  name: "Blockspace Forum",
  tagline: "Forum built to improve the Ethereum transaction journey.",
  description: "Education, research, and open source tooling for the infrastructure that moves Ethereum's transactions. This forum ships.",

{banner_js}

  links: {{
{links_js}
  }},

  research: [
    {{
      title: "An Observation on Ethereum's Blockspace Market",
      authors: "Kubi M., Alex T., Kevin L., Justin D.",
      date: "Dec 2025",
      summary: "Structural analysis of PBS economics, robustness, performance, and services.",
      url: "https://ethresear.ch/t/an-observation-on-ethereum-s-blockspace-market/23669",
      featured: true,
    }},
    {{
      title: "Block Constraints Sharing: Multi-Relay Inclusion Lists & Beyond",
      authors: "Blockspace Forum",
      date: "2025",
      summary: "Inter-relay constraint coordination for inclusion list enforcement. Foreshadows relay consensus mechanisms for sub-slot auctions.",
      url: "https://ethresear.ch/t/block-constraints-sharing-multi-relay-inclusion-lists-beyond/22752",
      featured: true
    }},
    {{
      title: "Block Merging: Boosting Value & Censorship Resistance",
      authors: "Michael, Kubi",
      date: "Jun 2025",
      summary: "Merging top-of-block segments from multiple relays into a single, more valuable, censorship-resistant block.",
      url: "https://ethresear.ch/t/relay-block-merging-boosting-value-censorship-resistance/22592",
      featured: true,
    }},
    {{
      title: "Relay Inclusion Lists",
      authors: "Michael, Kubi",
      date: "Apr 2025",
      summary: "A mechanism for relays to enforce transaction inclusion, improving censorship resistance without protocol changes.",
      url: "https://ethresear.ch/t/relay-inclusion-lists/22218",
      featured: true
    }},
  ],

  tooling: {{
    operate: [
      {{ name: "Commit-Boost", description: "Validator sidecar for PBS, preconfirmations, and commitments.", url: "https://github.com/commit-boost/commit-boost-client" }},
      {{ name: "Helix", description: "Open source relay implementation.", url: "https://github.com/gattaca-com/helix" }},
      {{ name: "rbuilder", description: "Open source block builder.", url: "https://github.com/flashbots/rbuilder" }},
    ],
    observe: [
      {{ name: "txdelay.xyz", description: "Transaction delay visualization", url: "https://txdelay.xyz/" }},
      {{ name: "bids.pics", description: "Relay and builder market share", url: "https://bids.pics/" }},
      {{ name: "Rated Explorer", description: "Validator monitoring", url: "https://explorer.rated.network/" }},
      {{ name: "relayscan.io", description: "Relay monitoring and statistics", url: "https://www.relayscan.io/" }},
      {{ name: "commit-boost.org", description: "Commit-Boost validator sidecar dashboard", url: "https://www.commit-boost.org/" }},
    ],
  }},

  contribute: [
    {{ name: "commit-boost-client", lang: "Rust", description: "Validator sidecar for PBS, preconfirmations, and commitments.", url: "https://github.com/commit-boost/commit-boost-client" }},
    {{ name: "helix", lang: "Rust", description: "Open source relay implementation.", url: "https://github.com/gattaca-com/helix" }},
    {{ name: "rbuilder", lang: "Rust", description: "Open source block builder.", url: "https://github.com/flashbots/rbuilder" }},
  ],

  events: [
    {{
      title: "Blockspace Forum Cannes 2026",
      location: "Cannes, France",
      year: "2026",
      description: "The second Blockspace Forum gathering. Workshops, research presentations, and working sessions on the future of Ethereum's blockspace market.",
      video: "https://www.youtube.com/embed/ixJDu_h4unQ",
      status: "Workshop Summary",
      link: "learn/events/cannes-2026.html",
      videos: [
        {{
          title: "Kick-Off — Kubi Mensah (Gattaca)",
          summary: "Forum framing: Ethereum's core product is blockspace. The mission is conversations to specs to MVPs to production code.",
          video: "https://www.youtube.com/embed/W279wYFI0EI",
        }},
        {{
          title: "Inside the pipeline: Data driven truths of Ethereum's supply chain — Lorenzo (Gattaca) & Christian (ultra sound)",
          summary: "50ms CEX-DEX replacement latency. 7M bundles per hour at peak. 90% of blocks via relays. Timing games quantified.",
          video: "https://www.youtube.com/embed/di5a6BF2bII",
        }},
        {{
          title: "Gwei GPT: Ethereum transaction rails in an AI world — Alex Stokes (EF)",
          summary: "How AI reshapes every layer: intent explosion, wallet disappearance, solver markets, builder vertical integration, and the security arms race.",
          video: "https://www.youtube.com/embed/kWUwyg0J-Dc",
        }},
        {{
          title: "ePBS Fireside Chat — Terence (Prysm) & Alex (ultra sound)",
          summary: "Devnet 0 complete, Devnet 1 started. PTC deadline debate. Does ePBS kill relays? Testing is the bottleneck. Q2/Q3 estimate for mainnet.",
          video: "https://www.youtube.com/embed/B-rk9FISVEE",
        }},
        {{
          title: "EIP-7928: Block-Level Access Lists and what it means for builders — Toni (EF)",
          summary: "How BALs enable parallel execution, faster sync, and gas limit scaling from 60M to 300M. Builder impact under ePBS: less build time, but can start earlier by applying state asynchronously.",
          video: "https://www.youtube.com/embed/5kRqSvwDPSE",
        }},
        {{
          title: "Institutional Investment — Zach (Grayscale) & Nixo (EF)",
          summary: "ETH as commodity investing. Trust over speed and scale. Stablecoins plus tokenization equals Ethereum. The macro backdrop and dollar skepticism.",
          video: "https://www.youtube.com/embed/ehYESl6Pdd4",
        }},
        {{
          title: "Issuance and why the transaction pipeline should care — Jerome (Ethereum France)",
          summary: "The diamond rule: max 0.5% issuance. 33.3M ETH staked and trending to 40%. Security problems, LST substitution risk, and the snowball effect.",
          video: "https://www.youtube.com/embed/E8f8DHzpDnQ",
        }},
        {{
          title: "The proof is in the building — Sean (Sigma Prime)",
          summary: "Generating validity proofs in under 10 seconds. How the ePBS slot structure creates a natural proving window. Parallel proving and L2 horizontal scaling.",
          video: "https://www.youtube.com/embed/Lw_z2bjD_cM",
        }},
        {{
          title: "I can see all your transactions: Privacy and what institutions need — Mo (EF)",
          summary: "It turns out large institutions and governments really care about the same properties we do: censorship resistance, open source, privacy, and security.",
          video: "https://www.youtube.com/embed/AnfW2Rk97FE",
        }},
        {{
          title: "Builder Services & Exclusive Flow — Panel",
          summary: "Builders compete on trust, execution guarantees, privacy, and latency. The exclusive order flow flywheel. Platform business model thinking.",
          video: "https://www.youtube.com/embed/-dJhPc4aKbc",
        }},
        {{
          title: "Post-Quantum & ETH Vision — Fede (Lambda Class) & Justin Drake (EF)",
          summary: "Neutral atoms: 6K qubits today, 26K theoretically. Post-quantum heartbeat design. ETH as the internet of value. Shielded L1 transfers.",
          video: "https://www.youtube.com/embed/UMKEV_g15OY",
        }},
      ],
    }},
    {{
      title: "Blockspace Forum @ Devconnect BA",
      location: "Buenos Aires, Argentina",
      year: "2025",
      description: "The inaugural event. Comparing notes on what's working, what's brittle, and what's being left on the table in Ethereum's blockspace pipeline.",
      header_description: "Blockspace Forum's first event in Buenos Aires, 2025.",
      status: "Workshop Summary",
      link: "https://ethresear.ch/t/an-observation-on-ethereum-s-blockspace-market/23669",
    }},
  ],

  posts: [
{posts_js}
  ],
}};
"""

    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(config)
    print("  Built config.js")


# ---- Build Learn Pages ---- #

def build_learn():
    """Read content/learn/**/*.md, generate learn/**/*.html."""
    md_files = sorted(f for f in LEARN_CONTENT_DIR.rglob("*.md")
                      if "series" not in f.relative_to(LEARN_CONTENT_DIR).parts)

    if not md_files:
        print("No learn markdown files found in content/learn/")
        return []

    learn_template = load_template("learn-page.html")
    pages = []

    LEARN_DIR.mkdir(exist_ok=True)

    for md_file in md_files:
        text = md_file.read_text()
        meta, body = parse_frontmatter(text)

        # Compute subpath relative to content/learn/
        rel = md_file.relative_to(LEARN_CONTENT_DIR)
        subdir = str(rel.parent) if str(rel.parent) != "." else ""
        slug = md_file.stem
        title = meta.get("title", slug)
        series = meta.get("series", "")
        subtitle = meta.get("subtitle", "")
        order = meta.get("order", 0)
        prev_slug = meta.get("prev", "")
        next_slug = meta.get("next", "")

        # Clean up leading whitespace from each line
        body = '\n'.join(line.strip() for line in body.split('\n'))

        # Convert stat callouts before markdown processing
        body = convert_stat_callouts(body)

        # Convert markdown to HTML
        content_html = markdown.markdown(
            body,
            extensions=['extra', 'smarty'],
            output_format='html5'
        )

        # Post-process: image captions
        content_html = add_image_captions(content_html)

        pages.append({
            "slug": slug,
            "subdir": subdir,
            "title": title,
            "series": series,
            "subtitle": subtitle,
            "order": order,
            "prev": prev_slug,
            "next": next_slug,
            "content": content_html,
        })

    # Sort by order
    pages.sort(key=lambda p: p["order"])

    # Build a lookup for prev/next titles
    title_map = {p["slug"]: p for p in pages}

    for page in pages:
        prev_link = ""
        next_link = ""
        if page["prev"] and page["prev"] in title_map:
            p = title_map[page["prev"]]
            prev_link = f'<a href="{p["slug"]}.html" class="learn-nav-prev">&larr; {p["series"]}: {p["title"]}</a>'
        if page["next"] and page["next"] in title_map:
            n = title_map[page["next"]]
            next_link = f'<a href="{n["slug"]}.html" class="learn-nav-next">{n["series"]}: {n["title"]} &rarr;</a>'

        subdir = page.get("subdir", "")
        depth = len(Path(subdir).parts) + 1 if subdir else 1
        base = "../" * depth
        if subdir:
            page_path_val = f"learn/{subdir}/{page['slug']}.html"
        else:
            page_path_val = f"learn/{page['slug']}.html"

        html = render_template(learn_template, {
            "title": page["title"],
            "series": page["series"],
            "subtitle": page["subtitle"],
            "slug": page["slug"],
            "content": page["content"],
            "prev_link": prev_link,
            "next_link": next_link,
            "base": base,
            "page_path": page_path_val,
            "site_url": SITE_URL,
        })

        subdir = page.get("subdir", "")
        if subdir:
            out_dir = LEARN_DIR / subdir
            out_dir.mkdir(parents=True, exist_ok=True)
            out_path = out_dir / f"{page['slug']}.html"
            page_path = f"learn/{subdir}/{page['slug']}.html"
        else:
            out_path = LEARN_DIR / f"{page['slug']}.html"
            page_path = f"learn/{page['slug']}.html"
        out_path.write_text(html)
        print(f"  Built {page_path}")

    return pages

# ---- Build Pages ---- #

def build_pages():
    """Generate index.html and blog.html from templates."""
    for page in ["index.html", "blog.html", "events.html", "research.html", "learn.html"]:
        template = load_template(page)
        (SITE_DIR / page).write_text(template.replace("{{site_url}}", SITE_URL))
        print(f"  Built {page}")

# ---- Clean ---- #

def clean():
    """Remove generated post HTML files."""
    for f in POSTS_DIR.glob("*.html"):
        f.unlink()
        print(f"  Removed learn/series/{f.name}")


# ---- Build Sitemap ---- #

SITE_URL = "https://blockspace.forum"

def build_sitemap(posts_meta, learn_pages):
    """Generate sitemap.xml from all pages."""
    from datetime import date as d
    today = d.today().isoformat()

    urls = []

    # Static pages
    for page, priority in [
        ("", "1.0"),
        ("learn.html", "0.9"),
        ("research.html", "0.8"),
        ("blog.html", "0.7"),
        ("events.html", "0.6"),
    ]:
        urls.append(f"""  <url>
    <loc>{SITE_URL}/{page}</loc>
    <lastmod>{today}</lastmod>
    <priority>{priority}</priority>
  </url>""")

    # Learn pages
    for page in learn_pages:
        subdir = page.get('subdir', '')
        sub_prefix = f"{subdir}/" if subdir else ""
        urls.append(f"""  <url>
    <loc>{SITE_URL}/learn/{sub_prefix}{page['slug']}.html</loc>
    <lastmod>{today}</lastmod>
    <priority>0.9</priority>
  </url>""")

    # Posts
    for post in posts_meta:
        date = post.get("date", today)
        urls.append(f"""  <url>
    <loc>{SITE_URL}/learn/series/{post['slug']}.html</loc>
    <lastmod>{date}</lastmod>
    <priority>0.7</priority>
  </url>""")

    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    (SITE_DIR / "sitemap.xml").write_text(sitemap)
    print("  Built sitemap.xml")

# ---- Main ---- #

def main():
    if "--clean" in sys.argv:
        print("Cleaning...")
        clean()

    print("Building...")
    posts_meta = build_posts()
    build_config(posts_meta)
    learn_pages = build_learn()
    build_pages()
    build_sitemap(posts_meta, learn_pages)
    print(f"\nDone. {len(posts_meta)} posts, {len(learn_pages)} learn pages built.")

if __name__ == "__main__":
    main()
