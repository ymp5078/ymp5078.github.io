<div class="publications">
<ol class="bibliography">

{% for link in site.data.reports.main %}

<li data-tags="{{ link.tags | join: '|' }}" data-search="{{ link.title }} {{ link.authors | strip_html }} {{ link.conference | strip_html }} {{ link.tags | join: ' ' }} {{ link.notes }}">
<div class="pub-row">
  <div class="col-sm-3" style="position: relative;padding-right: 15px;padding-left: 15px;">
    {% if link.image %} 
    <img src="{{ link.image }}" class="teaser img-fluid z-depth-1" style="width=100;height=40%">
    {% if link.conference_short %} 
    <abbr class="badge">{{ link.conference_short }}</abbr>
    {% endif %}
    {% endif %}
  </div>
  <div class="col-sm-9" style="position: relative;padding-right: 15px;padding-left: 20px;">
      <div class="title"><a href="{{ link.pdf }}">{{ link.title }}</a></div>
      <div class="author">{{ link.authors }}</div>
      <div class="periodical"><em>{{ link.conference }}</em>
      </div>
    {% if link.description %}
      <div class="pub-desc">{{ link.description }}</div>
    {% endif %}
    <div class="links">
      {% if link.pdf %} 
      <a href="{{ link.pdf }}" class="btn btn-sm z-depth-0" role="button" target="_blank" style="font-size:12px;">PDF</a>
      {% endif %}
      {% if link.notes %} 
      <strong> <i style="color:#e74d3c">&#9733; {{ link.notes }}</i></strong>
      {% endif %}
    </div>
  </div>
</div>
</li>
<br>

{% endfor %}

</ol>
</div>
