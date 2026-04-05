(function () {
  'use strict';

  const state = {
    site: null,
    categories: [],
    toolIndex: [],
    tools: [],
    currentCategory: '',
    currentSlug: '',
    currentTool: null,
    isCreating: false,
    isAuthenticated: false,
  };

  const flashEl = document.getElementById('flash');
  const categorySelect = document.getElementById('toolCategorySelect');
  const toolSelect = document.getElementById('toolSelect');
  const buildOutput = document.getElementById('buildOutput');

  // Authentication functions
  async function checkAuthentication() {
    try {
      const response = await request('/api/check-auth');
      state.isAuthenticated = response.authenticated;
      
      if (!state.isAuthenticated) {
        window.location.href = '/admin/login';
        return false;
      }
      return true;
    } catch (error) {
      window.location.href = '/admin/login';
      return false;
    }
  }

  async function logout() {
    try {
      await request('/api/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      showFlash('Logout failed: ' + error.message, true);
    }
  }

  // Tool reordering functions
  function showReorderSection() {
    const reorderSection = document.getElementById('reorderToolsSection');
    const toolsList = document.getElementById('reorderableToolsList');
    
    reorderSection.style.display = 'block';
    
    // Load current tools and make them reorderable
    const tools = loadToolsForCategory(state.currentCategory);
    toolsList.innerHTML = tools.map(tool => `
      <div class="reorderable-item" draggable="true" data-tool-id="${tool.id}">
        <span class="drag-handle">⋮⋮</span>
        <div class="tool-info">
          <div class="tool-name">${tool.name}</div>
          <div class="tool-slug">/${tool.category}/${tool.slug}/</div>
        </div>
      </div>
    `).join('');
    
    setupDragAndDrop();
  }

  function hideReorderSection() {
    document.getElementById('reorderToolsSection').style.display = 'none';
  }

  function loadToolsForCategory(categoryId) {
    if (!categoryId) return [];
    return state.toolIndex.find(cat => cat.id === categoryId)?.tools || [];
  }

  function setupDragAndDrop() {
    const items = document.querySelectorAll('.reorderable-item');
    let draggedItem = null;

    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', (e) => {
        item.classList.remove('dragging');
        draggedItem = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = getDragAfterElement(e.currentTarget.parentNode, e.clientY);
        if (afterElement == null) {
          e.currentTarget.parentNode.appendChild(draggedItem);
        } else {
          e.currentTarget.parentNode.insertBefore(draggedItem, afterElement);
        }
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
      });

      item.addEventListener('dragenter', (e) => {
        if (e.target.classList.contains('reorderable-item') && e.target !== draggedItem) {
          e.target.classList.add('drag-over');
        }
      });

      item.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('reorderable-item')) {
          e.target.classList.remove('drag-over');
        }
      });
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.reorderable-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  async function saveToolOrder() {
    const items = document.querySelectorAll('.reorderable-item');
    const toolIds = Array.from(items).map(item => item.dataset.toolId);
    
    try {
      const response = await request('/api/reorder-tools', {
        method: 'POST',
        body: JSON.stringify({
          category: state.currentCategory,
          toolIds: toolIds
        })
      });
      
      showFlash('Tool order saved successfully');
      hideReorderSection();
      
      // Refresh the tool index and select
      state.toolIndex = response.toolIndex;
      populateToolSelect();
      
    } catch (error) {
      showFlash('Failed to save tool order: ' + error.message, true);
    }
  }

  function showFlash(message, isError) {
    flashEl.hidden = false;
    flashEl.textContent = message;
    flashEl.classList.toggle('error', Boolean(isError));
    window.clearTimeout(showFlash.timer);
    showFlash.timer = window.setTimeout(() => {
      flashEl.hidden = true;
    }, 3000);
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      window.location.href = '/admin/login';
      throw new Error('Authentication required');
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }
    return data;
  }

  async function bootstrap() {
    // Check authentication first
    if (!await checkAuthentication()) {
      return;
    }

    try {
      const data = await request('/api/bootstrap');
      state.site = data.site;
      state.categories = data.categories;
      state.toolIndex = data.toolIndex;
      
      renderSiteForm();
      renderCategoriesTable();
      populateCategorySelect();
      populateToolSelect();
      setupEventListeners();
      
      showFlash('Admin panel loaded successfully');
    } catch (error) {
      showFlash('Failed to load admin panel: ' + error.message, true);
    }
  }

  function prettyJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function parseJsonTextarea(label, value, fallback) {
    if (!value.trim()) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new Error(`${label} must be valid JSON.`);
    }
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') {
      el.checked = Boolean(value);
    } else {
      el.value = value == null ? '' : value;
    }
  }

  function getValue(id) {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.type === 'checkbox') return el.checked;
    return el.value;
  }

  function renderSiteForm() {
    const site = state.site;
    setValue('siteName', site.siteName);
    setValue('logoText', site.logoText);
    setValue('baseUrl', site.baseUrl);
    setValue('defaultSocialImage', site.defaultSocialImage);
    setValue('footerBottomText', site.footerBottomText);
    setValue('homeTitle', site.homepage.title);
    setValue('homeDescription', site.homepage.description);
    setValue('homeHeroTitle', site.homepage.heroTitle);
    setValue('homeHeroDescription', site.homepage.heroDescription);
    setValue('homeFooterTagline', site.homepage.footerTagline);
    setValue('toolFooterTagline', site.toolPage.footerTagline);
    setValue('categoryFooterTagline', site.categoryPage.footerTagline);
    setValue('toolBadges', prettyJson(site.toolBadges));
    setValue('navigationJson', prettyJson(site.navigation));
    setValue('footerColumnsJson', prettyJson(site.footerColumns));
    setValue('aboutTitle', site.staticPages.about.title);
    setValue('aboutMetaDescription', site.staticPages.about.metaDescription);
    setValue('aboutHeading', site.staticPages.about.heading);
    setValue('aboutContentHtml', site.staticPages.about.contentHtml);
    setValue('privacyTitle', site.staticPages.privacy.title);
    setValue('privacyMetaDescription', site.staticPages.privacy.metaDescription);
    setValue('privacyHeading', site.staticPages.privacy.heading);
    setValue('privacyContentHtml', site.staticPages.privacy.contentHtml);
  }

  function renderCategoriesTable() {
    const tbody = document.querySelector('#categoriesTable tbody');
    tbody.innerHTML = state.categories
      .map(
        (category, index) => `<tr data-index="${index}">
          <td><input data-key="id" value="${escapeHtml(category.id)}"></td>
          <td><input data-key="name" value="${escapeHtml(category.name)}"></td>
          <td><input data-key="slug" value="${escapeHtml(category.slug)}"></td>
          <td><input data-key="icon" value="${escapeHtml(category.icon)}"></td>
          <td><input data-key="color" value="${escapeHtml(category.color)}"></td>
          <td><textarea data-key="description" rows="3">${escapeHtml(category.description)}</textarea></td>
        </tr>`
      )
      .join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderToolSelects() {
    categorySelect.innerHTML = state.toolIndex
      .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
      .join('');

    if (!state.currentCategory && state.toolIndex.length) {
      state.currentCategory = state.toolIndex[0].id;
    }

    categorySelect.value = state.currentCategory;
    renderToolList();
  }

  function renderToolList() {
    const currentCategory = state.toolIndex.find((category) => category.id === state.currentCategory);
    const tools = currentCategory ? currentCategory.tools.slice().sort((a, b) => a.name.localeCompare(b.name)) : [];
    toolSelect.innerHTML = tools
      .map((tool) => `<option value="${tool.slug}">${escapeHtml(tool.name)}</option>`)
      .join('');

    if (!tools.find((tool) => tool.slug === state.currentSlug)) {
      state.currentSlug = tools[0] ? tools[0].slug : '';
    }

    toolSelect.value = state.currentSlug;
  }

  function blankTool(categoryId) {
    return {
      id: '',
      slug: '',
      name: '',
      tagline: '',
      description: '',
      keywords: [],
      category: categoryId,
      faqs: [],
      relatedTools: [],
      externalLinks: [],
      priority: 0.7,
      monthlySearches: 0,
      evergreen: true,
      seoTitle: '',
      metaDescription: '',
      imageUrl: '',
      canonicalUrl: '',
    };
  }

  function renderToolForm(tool) {
    const current = tool || blankTool(state.currentCategory);
    state.currentTool = current;
    setValue('toolId', current.id);
    setValue('toolSlug', current.slug);
    setValue('toolName', current.name);
    setValue('toolTagline', current.tagline);
    setValue('toolDescription', current.description);
    setValue('toolSeoTitle', current.seoTitle || '');
    setValue('toolMetaDescription', current.metaDescription || '');
    setValue('toolImageUrl', current.imageUrl || '');
    setValue('toolCanonicalUrl', current.canonicalUrl || '');
    setValue('toolKeywords', (current.keywords || []).join(', '));
    setValue('toolRelatedTools', (current.relatedTools || []).join(', '));
    setValue('toolExternalLinks', prettyJson(current.externalLinks || []));
    setValue('toolPriority', current.priority ?? 0.7);
    setValue('toolMonthlySearches', current.monthlySearches ?? 0);
    setValue('toolEvergreen', Boolean(current.evergreen));
    setValue('toolFaqs', prettyJson(current.faqs || []));
    document.getElementById('saveToolBtn').textContent = state.isCreating ? 'Create Tool' : 'Save Tool';
  }

  async function loadToolList(categoryId) {
    state.tools = await request(`/api/tools?category=${encodeURIComponent(categoryId)}`);
  }

  async function loadCurrentTool() {
    if (!state.currentCategory) return;
    await loadToolList(state.currentCategory);
    if (!state.currentSlug) {
      state.isCreating = true;
      renderToolForm(blankTool(state.currentCategory));
      return;
    }
    const tool = state.tools.find((item) => item.slug === state.currentSlug);
    state.isCreating = false;
    renderToolForm(tool || blankTool(state.currentCategory));
  }

  function collectSiteForm() {
    return {
      siteName: getValue('siteName'),
      logoText: getValue('logoText'),
      baseUrl: getValue('baseUrl'),
      defaultSocialImage: getValue('defaultSocialImage'),
      footerBottomText: getValue('footerBottomText'),
      homepage: {
        title: getValue('homeTitle'),
        description: getValue('homeDescription'),
        heroTitle: getValue('homeHeroTitle'),
        heroDescription: getValue('homeHeroDescription'),
        footerTagline: getValue('homeFooterTagline'),
      },
      toolPage: {
        footerTagline: getValue('toolFooterTagline'),
      },
      categoryPage: {
        footerTagline: getValue('categoryFooterTagline'),
      },
      toolBadges: parseJsonTextarea('Tool badges', getValue('toolBadges'), []),
      navigation: parseJsonTextarea('Navigation JSON', getValue('navigationJson'), []),
      footerColumns: parseJsonTextarea('Footer columns JSON', getValue('footerColumnsJson'), []),
      staticPages: {
        about: {
          title: getValue('aboutTitle'),
          metaDescription: getValue('aboutMetaDescription'),
          heading: getValue('aboutHeading'),
          contentHtml: getValue('aboutContentHtml'),
        },
        privacy: {
          title: getValue('privacyTitle'),
          metaDescription: getValue('privacyMetaDescription'),
          heading: getValue('privacyHeading'),
          contentHtml: getValue('privacyContentHtml'),
        },
      },
    };
  }

  function collectCategories() {
    return Array.from(document.querySelectorAll('#categoriesTable tbody tr')).map((row) => {
      const item = {};
      row.querySelectorAll('[data-key]').forEach((field) => {
        item[field.dataset.key] = field.value;
      });
      return item;
    });
  }

  function collectToolForm() {
    return {
      id: getValue('toolId'),
      slug: getValue('toolSlug'),
      name: getValue('toolName'),
      tagline: getValue('toolTagline'),
      description: getValue('toolDescription'),
      seoTitle: getValue('toolSeoTitle'),
      metaDescription: getValue('toolMetaDescription'),
      imageUrl: getValue('toolImageUrl'),
      canonicalUrl: getValue('toolCanonicalUrl'),
      keywords: getValue('toolKeywords')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      relatedTools: getValue('toolRelatedTools')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      externalLinks: parseJsonTextarea('Useful links JSON', getValue('toolExternalLinks'), []),
      faqs: parseJsonTextarea('FAQs JSON', getValue('toolFaqs'), []),
      priority: Number(getValue('toolPriority') || 0.7),
      monthlySearches: Number(getValue('toolMonthlySearches') || 0),
      evergreen: getValue('toolEvergreen'),
      category: state.currentCategory,
    };
  }

  async function refreshToolIndex(index) {
    state.toolIndex = index;
    renderToolSelects();
    await loadCurrentTool();
  }

  async function bootstrap() {
    // Check authentication first
    if (!await checkAuthentication()) {
      return;
    }

    try {
      const data = await request('/api/bootstrap');
      state.site = data.site;
      state.categories = data.categories;
      state.toolIndex = data.toolIndex;
      
      // Update dashboard stats
      updateDashboardStats();
      
      // Render all sections
      renderSiteForm();
      renderCategoriesTable();
      renderToolSelects();
      renderSeoForm();
      renderPagesForm();
      
      // Setup page title and description based on active section
      updatePageInfo('dashboard');
      
      showFlash('Admin panel loaded successfully');
    } catch (error) {
      showFlash('Failed to load admin panel: ' + error.message, true);
    }
  }

  function updateDashboardStats() {
    // Calculate total tools
    let totalTools = 0;
    state.toolIndex.forEach(category => {
      totalTools += category.tools.length;
    });
    
    // Update dashboard stats
    document.getElementById('totalTools').textContent = totalTools;
    document.getElementById('totalCategories').textContent = state.categories.length;
    document.getElementById('siteStatus').textContent = 'Live';
    document.getElementById('lastBuild').textContent = new Date().toLocaleTimeString();
  }

  function updatePageInfo(section) {
    const titles = {
      dashboard: 'Dashboard',
      global: 'Global Settings',
      seo: 'SEO & Meta Configuration',
      categories: 'Categories Management',
      tools: 'Tools Management',
      pages: 'Static Pages',
      build: 'Build & Preview',
      analytics: 'Site Analytics'
    };
    
    const descriptions = {
      dashboard: 'Site overview and quick actions',
      global: 'Configure site-wide settings and branding',
      seo: 'Manage SEO, meta tags, and social media settings',
      categories: 'Organize and manage tool categories',
      tools: 'Create and edit mystical tools',
      pages: 'Edit static pages like About and Privacy',
      build: 'Build and preview your site',
      analytics: 'View site statistics and usage data'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Admin Panel';
    document.getElementById('pageDescription').textContent = descriptions[section] || 'Manage your site';
  }

  function renderSeoForm() {
    const site = state.site;
    setValue('metaKeywords', (site.metaKeywords || []).join(', '));
    setValue('metaAuthor', site.metaAuthor || '');
    setValue('metaRobots', site.metaRobots || 'index, follow');
    setValue('ogSiteName', site.ogSiteName || site.siteName);
    setValue('ogType', site.ogType || 'website');
    setValue('ogDescription', site.ogDescription || '');
    setValue('ogImage', site.ogImage || site.defaultSocialImage);
    setValue('twitterCard', site.twitterCard || 'summary_large_image');
    setValue('twitterSite', site.twitterSite || '');
    setValue('twitterCreator', site.twitterCreator || '');
    setValue('googleAnalytics', site.googleAnalytics || '');
    setValue('gtmId', site.gtmId || '');
    setValue('customTracking', site.customTracking || '');
  }

  function renderPagesForm() {
    const site = state.site;
    setValue('aboutTitle', site.staticPages?.about?.title || '');
    setValue('aboutMetaDescription', site.staticPages?.about?.metaDescription || '');
    setValue('aboutHeading', site.staticPages?.about?.heading || '');
    setValue('aboutContentHtml', site.staticPages?.about?.contentHtml || '');
    setValue('privacyTitle', site.staticPages?.privacy?.title || '');
    setValue('privacyMetaDescription', site.staticPages?.privacy?.metaDescription || '');
    setValue('privacyHeading', site.staticPages?.privacy?.heading || '');
    setValue('privacyContentHtml', site.staticPages?.privacy?.contentHtml || '');
  }

  function collectSeoForm() {
    return {
      metaKeywords: getValue('metaKeywords').split(',').map(k => k.trim()).filter(Boolean),
      metaAuthor: getValue('metaAuthor'),
      metaRobots: getValue('metaRobots'),
      ogSiteName: getValue('ogSiteName'),
      ogType: getValue('ogType'),
      ogDescription: getValue('ogDescription'),
      ogImage: getValue('ogImage'),
      twitterCard: getValue('twitterCard'),
      twitterSite: getValue('twitterSite'),
      twitterCreator: getValue('twitterCreator'),
      googleAnalytics: getValue('googleAnalytics'),
      gtmId: getValue('gtmId'),
      customTracking: getValue('customTracking'),
    };
  }

  function collectPagesForm() {
    return {
      staticPages: {
        about: {
          title: getValue('aboutTitle'),
          metaDescription: getValue('aboutMetaDescription'),
          heading: getValue('aboutHeading'),
          contentHtml: getValue('aboutContentHtml'),
        },
        privacy: {
          title: getValue('privacyTitle'),
          metaDescription: getValue('privacyMetaDescription'),
          heading: getValue('privacyHeading'),
          contentHtml: getValue('privacyContentHtml'),
        },
      },
    };
  }

  function addActivityLog(message, type = 'info') {
    const activityList = document.getElementById('recentActivity');
    const time = new Date().toLocaleTimeString();
    
    const icons = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
      <div class="activity-icon">${icons[type]}</div>
      <div class="activity-content">
        <div class="activity-title">${message}</div>
        <div class="activity-time">${time}</div>
      </div>
    `;
    
    // Add to top of list
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Keep only last 10 items
    const items = activityList.querySelectorAll('.activity-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }

  // Quick action functions
  window.quickSaveSettings = async function() {
    await saveSite();
  };

  window.quickAddTool = function() {
    // Navigate to tools section and create new tool
    document.querySelectorAll('.nav-btn').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.querySelector('[data-section="tools"]').classList.add('active');
    document.getElementById('section-tools').classList.add('active');
    updatePageInfo('tools');
    
    // Trigger new tool creation
    document.getElementById('newToolBtn').click();
  };

  window.quickPreview = function() {
    window.open('/', '_blank');
  };

  window.quickBuild = async function() {
    try {
      showFlash('🔄 Building site...');
      const response = await request('/api/build', {
        method: 'POST',
        body: '{}',
      });
      
      if (response.ok) {
        showFlash('✅ Site built successfully!');
        addActivityLog('Site rebuilt successfully', 'success');
      } else {
        showFlash('⚠️ Build had errors', true);
        addActivityLog('Build completed with errors', 'warning');
      }
    } catch (error) {
      showFlash('Build failed: ' + error.message, true);
      addActivityLog('Build failed: ' + error.message, 'error');
    }
  };

  function wireSections() {
    document.querySelectorAll('.nav-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const section = button.dataset.section;
        
        // Update navigation state
        document.querySelectorAll('.nav-btn').forEach((item) => item.classList.remove('active'));
        document.querySelectorAll('.section').forEach((section) => section.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(`section-${section}`).classList.add('active');
        
        // Update page info
        updatePageInfo(section);
        
        // Add activity log
        addActivityLog(`Navigated to ${section}`, 'info');
      });
    });
  }

  async function saveSite() {
    const saveBtn = document.getElementById('saveSiteBtn');
    const originalText = saveBtn.textContent;
    
    // Set loading state
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';
    
    const site = collectSiteForm();
    console.log('Sending site data:', JSON.stringify(site, null, 2));
    
    try {
      // Save the data first
      const data = await request('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(site),
      });
      
      console.log('Save response:', data);
      console.log('Updated site data:', data.site);
      
      // Update local state with saved data
      state.site = data.site;
      renderSiteForm();
      showFlash('✅ Settings saved! Rebuilding site...');
      addActivityLog('Global settings saved', 'success');
      
      // Wait a moment before starting rebuild to ensure save is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Now rebuild the site
      const buildSuccess = await rebuildSite();
      
      // Only refresh if build was successful
      if (buildSuccess) {
        showFlash('🎉 Success! Refreshing admin panel...');
        setTimeout(() => {
          console.log('Refreshing admin panel...');
          window.location.reload();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Save error:', error);
      showFlash(error.message, true);
      addActivityLog('Failed to save settings: ' + error.message, 'error');
    } finally {
      // Restore button state
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  }

  async function saveSeoSettings() {
    const saveBtn = document.getElementById('saveSeoBtn');
    const originalText = saveBtn.textContent;
    
    // Set loading state
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';
    
    try {
      const seoData = collectSeoForm();
      const data = await request('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoData),
      });
      
      state.site = data.site;
      renderSeoForm();
      showFlash('✅ SEO settings saved!');
      addActivityLog('SEO settings saved', 'success');
      
    } catch (error) {
      console.error('Save error:', error);
      showFlash(error.message, true);
      addActivityLog('Failed to save SEO settings: ' + error.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  }

  async function savePages() {
    const saveBtn = document.getElementById('savePagesBtn');
    const originalText = saveBtn.textContent;
    
    // Set loading state
    saveBtn.disabled = true;
    saveBtn.textContent = '💾 Saving...';
    
    try {
      const pagesData = collectPagesForm();
      const data = await request('/api/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagesData),
      });
      
      state.site = data.site;
      renderPagesForm();
      showFlash('✅ Pages saved!');
      addActivityLog('Static pages saved', 'success');
      
    } catch (error) {
      console.error('Save error:', error);
      showFlash(error.message, true);
      addActivityLog('Failed to save pages: ' + error.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  }

  async function rebuildSite() {
    try {
      showFlash('🔄 Rebuilding site... This may take a moment.');
      console.log('Starting rebuild process...');
      
      const response = await request('/api/build', {
        method: 'POST',
        body: '{}',
      });
      
      console.log('Build response:', response);
      console.log('Build stdout:', response.stdout);
      console.log('Build stderr:', response.stderr);
      
      if (response.ok) {
        showFlash('✅ Global settings saved and site rebuilt successfully! Changes are now live.');
        console.log('Build completed successfully');
        return true;
      } else {
        showFlash('⚠️ Settings saved but build had errors. Check build output.', true);
        console.log('Build completed with errors');
        
        // Show build output in the build section for debugging
        const buildOutput = document.getElementById('buildOutput');
        if (buildOutput) {
          buildOutput.value = response.stderr || 'Build completed with errors';
          // Switch to build section to show output
          document.querySelectorAll('.nav-btn').forEach(item => item.classList.remove('active'));
          document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
          document.querySelector('[data-section="build"]').classList.add('active');
          document.getElementById('section-build').classList.add('active');
        }
        
        return false;
      }
    } catch (error) {
      console.error('Build error:', error);
      showFlash('Settings saved but failed to rebuild site: ' + error.message, true);
      return false;
    }
  }

  async function saveCategories() {
    const categories = collectCategories();
    const data = await request('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories }),
    });
    state.categories = data.categories;
    await refreshToolIndex(data.toolIndex);
    renderCategoriesTable();
    showFlash('Categories saved.');
  }

  async function saveTool() {
    const tool = collectToolForm();
    if (state.isCreating) {
      const data = await request('/api/tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: state.currentCategory, tool }),
      });
      state.currentSlug = data.tool.slug;
      state.isCreating = false;
      await refreshToolIndex(data.toolIndex);
      showFlash('Tool created.');
      return;
    }

    const data = await request(
      `/api/tool?category=${encodeURIComponent(state.currentCategory)}&slug=${encodeURIComponent(state.currentSlug)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool }),
      }
    );
    state.currentSlug = data.tool.slug;
    await refreshToolIndex(data.toolIndex);
    showFlash('Tool saved.');
  }

  async function deleteTool() {
    if (state.isCreating || !state.currentSlug) {
      showFlash('Select an existing tool to delete.', true);
      return;
    }

    if (!window.confirm(`Delete ${state.currentTool.name}?`)) return;

    const data = await request(
      `/api/tool?category=${encodeURIComponent(state.currentCategory)}&slug=${encodeURIComponent(state.currentSlug)}`,
      { method: 'DELETE' }
    );
    state.currentSlug = '';
    state.isCreating = true;
    await refreshToolIndex(data.toolIndex);
    showFlash('Tool deleted.');
  }

  function createNewTool() {
    state.currentSlug = '';
    state.isCreating = true;
    renderToolForm(blankTool(state.currentCategory));
  }

  function previewCurrentTool() {
    if (state.isCreating) return;
    const slug = getValue('toolSlug') || state.currentSlug;
    if (!slug) return;
    window.open(`/${state.currentCategory}/${slug}/`, '_blank', 'noopener');
  }

  async function runBuild() {
    buildOutput.value = 'Building...';
    const data = await request('/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    buildOutput.value = `${data.stdout || ''}${data.stderr ? `\n${data.stderr}` : ''}`;
    showFlash(data.ok ? 'Build finished.' : 'Build finished with errors.', !data.ok);
  }

  categorySelect.addEventListener('change', async () => {
    state.currentCategory = categorySelect.value;
    renderToolList();
    await loadCurrentTool();
  });

  toolSelect.addEventListener('change', async () => {
    state.currentSlug = toolSelect.value;
    state.isCreating = false;
    await loadCurrentTool();
  });

  document.getElementById('saveSiteBtn').addEventListener('click', async () => {
    try {
      await saveSite();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('saveSeoBtn').addEventListener('click', async () => {
    try {
      await saveSeoSettings();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('savePagesBtn').addEventListener('click', async () => {
    try {
      await savePages();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('saveCategoriesBtn').addEventListener('click', async () => {
    try {
      await saveCategories();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('saveToolBtn').addEventListener('click', async () => {
    try {
      await saveTool();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('newToolBtn').addEventListener('click', createNewTool);
  document.getElementById('deleteToolBtn').addEventListener('click', async () => {
    try {
      await deleteTool();
    } catch (error) {
      showFlash(error.message, true);
    }
  });
  document.getElementById('previewToolBtn').addEventListener('click', previewCurrentTool);
  document.getElementById('buildBtn').addEventListener('click', async () => {
    try {
      await runBuild();
    } catch (error) {
      showFlash(error.message, true);
      buildOutput.value = error.message;
    }
  });

  document.getElementById('quickBuildBtn').addEventListener('click', async () => {
    try {
      await rebuildSite();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      await logout();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('reorderToolsBtn').addEventListener('click', () => {
    if (!state.currentCategory) {
      showFlash('Please select a category first', true);
      return;
    }
    showReorderSection();
  });

  document.getElementById('saveReorderBtn').addEventListener('click', async () => {
    try {
      await saveToolOrder();
    } catch (error) {
      showFlash(error.message, true);
    }
  });

  document.getElementById('cancelReorderBtn').addEventListener('click', () => {
    hideReorderSection();
  });

  wireSections();
  bootstrap().catch((error) => {
    showFlash(error.message, true);
  });
})();
