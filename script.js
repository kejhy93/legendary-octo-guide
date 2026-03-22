// Ensure the DOM is fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Get references to key DOM elements
    const contentContainer = document.getElementById('content-container');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    // Reference to the container for slideshow navigation buttons
    const navigationButtons = document.querySelector('.navigation');

    let slides = [];
    let currentSlide = 0;
    let currentView = 'slideshow'; // 'slideshow' or 'page'
    const slideshowButton = document.getElementById('slideshow-button');
    const pageButton = document.getElementById('page-button');
    let shortcutsVisible = true;

    /**
     * Displays a specific slide and manages the state of navigation buttons.
     * @param {number} index - The index of the slide to display.
     */
    function showSlide(index) {
        // Remove 'current' class from all slides to hide them
        slides.forEach((slide, i) => {
            slide.classList.remove('current');
            // Add 'current' class to the target slide to display it
            if (i === index) {
                slide.classList.add('current');
            }
        });
        // Disable 'Previous' button if on the first slide
        prevButton.disabled = index === 0;
        // Disable 'Next' button if on the last slide
        nextButton.disabled = index === slides.length - 1;
    }

    /**
     * Advances to the next slide in the slideshow.
     */
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            showSlide(currentSlide);
        }
    }

    /**
     * Goes back to the previous slide in the slideshow.
     */
    function prevSlide() {
        if (currentSlide > 0) {
            currentSlide--;
            showSlide(currentSlide);
        }
    }

    /**
     * Resets the slideshow to the first slide.
     */
    function goToStart() {
        currentSlide = 0;
        showSlide(currentSlide);
    }

    /**
     * Sets up event listeners for slideshow navigation (buttons and keyboard).
     */
    function setupSlideshowNavigation() {
        // Event listeners for 'Next' and 'Previous' buttons
        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);

        // Keyboard navigation for slides
        // Keyboard navigation for slides
        document.addEventListener('keydown', (event) => {
            if (currentView !== 'slideshow') return; // Only navigate in slideshow mode
            switch (event.key) {
                case 'ArrowRight': // Right arrow key for next slide
                case 'ArrowRight': // Right arrow key for next slide
                    nextSlide();
                    break;
                case 'ArrowLeft':  // Left arrow key for previous slide
                case 'ArrowLeft':  // Left arrow key for previous slide
                    prevSlide();
                    break;
                case 'Home':     // Home key to go to the first slide
                case 'R':        // 'R' key to go to the first slide
                case 'Home':     // Home key to go to the first slide
                case 'R':        // 'R' key to go to the first slide
                case 'r':
                    goToStart();
                    break;
                case 'Escape':   // ESC key to toggle shortcuts display
                    shortcutsVisible = !shortcutsVisible;
                    shortcutsInfoEl.classList.toggle('active', shortcutsVisible);
                    break;
                default:
                    return; // Do nothing for other keys
            }
            event.preventDefault(); // Prevent default browser actions for handled keys
        });
    }

    /**
     * Fetches a markdown file and returns its contents as text.
     * Centralizes HTTP status checking so all markdown views share the same behavior.
     *
     * @param {string} path - The path to the markdown file.
     * @returns {Promise<string>} - Resolves with the markdown content.
     */
    function fetchMarkdown(path) {
        return fetch(path).then((response) => {
            // Check if the HTTP response was successful (status 200-299)
            if (!response.ok) {
                throw new Error(`Failed to load "${path}" (status ${response.status})`);
            }
            return response.text();
        });
    }

    /**
     * Sanitizes HTML to prevent XSS attacks.
     * Converts markdown to HTML and sanitizes the result using DOMPurify.
     *
     * @param {string} markdownText - The Markdown text to convert and sanitize.
     * @returns {string} - Sanitized HTML string safe to insert into the DOM.
     */
    function sanitizeMarkdown(markdownText) {
        const htmlContent = marked.parse(markdownText);
        return DOMPurify.sanitize(htmlContent);
    }

    function setViewMode(mode) {
        const isSlideshow = mode === 'slideshow';
        currentView = mode;

        slideshowButton.setAttribute('aria-pressed', isSlideshow);
        pageButton.setAttribute('aria-pressed', !isSlideshow);

        slideshowButton.classList.toggle('active', isSlideshow);
        pageButton.classList.toggle('active', !isSlideshow);
    }

    function highlightCode() {
        // Scope Prism highlighting to the dynamic content container
        if (window.Prism && contentContainer) {
            Prism.highlightAllUnder(contentContainer);
        }
    }

    function renderError(view, message, error) {
        if (error) {
            console.error(message, error);
        } else {
            console.error(message);
        }

        // Clear existing content
        contentContainer.innerHTML = '';

        // Create wrapper depending on view type
        const wrapper = document.createElement('div');
        wrapper.className = view === 'slideshow' ? 'slide current' : 'page';

        const heading = document.createElement('h2');
        heading.textContent = 'Error';

        const paragraph = document.createElement('p');
        // Use textContent to avoid executing any markup in message
        paragraph.textContent = message;

        wrapper.appendChild(heading);
        wrapper.appendChild(paragraph);
        contentContainer.appendChild(wrapper);

        if (view === 'slideshow') {
            slides = [];
            currentSlide = 0;
            prevButton.disabled = true;
            nextButton.disabled = true;
        }
    }

    /**
     * Loads and displays the slideshow content from 'slide.md'.
     * Shows the slideshow navigation buttons.
     */
    function loadSlideshow() {
        currentView = 'slideshow';
        const intendedView = 'slideshow';
        setViewMode(intendedView);
        // Show navigation buttons for slideshow
        navigationButtons.classList.remove('hidden');
        fetchMarkdown('slide.md')
            .then(text => {
                if (currentView !== intendedView) return; // Abort if view has changed
                // Clear previous content
                contentContainer.innerHTML = '';
                // Split the Markdown text into individual slide contents using '---' as a delimiter
                const slideContents = text.split(/\n---\n/);
                slideContents.forEach(content => {
                    const slide = document.createElement('div');
                    slide.className = 'slide'; // Assign 'slide' class for styling
                    // Convert Markdown content to HTML and sanitize to prevent XSS
                    slide.innerHTML = sanitizeMarkdown(content);
                    contentContainer.appendChild(slide); // Add slide to the container
                });
                // Update the 'slides' NodeList and display the first slide (scoped to the content container)
                slides = contentContainer.querySelectorAll('.slide');
                currentSlide = 0;
                if (slides.length > 0) {
                    showSlide(0);
                }
                // Highlight code blocks using Prism.js after content is loaded
                highlightCode();
            })
            .catch(e => {
                if (currentView !== intendedView) return; // Abort if view has changed
                renderError('slideshow', 'Could not load presentation content.', e);
            });
    }

    /**
     * Loads and displays the full page content from 'page.md'.
     * Hides the slideshow navigation buttons.
     */
    function loadPage() {
        const intendedView = 'page';
        setViewMode(intendedView);
        // Hide navigation buttons for page view
        navigationButtons.classList.add('hidden');
        fetchMarkdown('page.md')
            .then(text => {
                if (currentView !== intendedView) return; // Abort if view has changed
                // Clear previous content and display the full page content with XSS protection
                const sanitized = sanitizeMarkdown(text);
                contentContainer.innerHTML = `<div class="page">${sanitized}</div>`;
                // Highlight code blocks using Prism.js after content is loaded
                highlightCode();
            })
            .catch(e => {
                if (currentView !== intendedView) return; // Abort if view has changed
                renderError('page', 'Could not load page content.', e);
            });
    }

    // Event listeners for view selection buttons
    slideshowButton.addEventListener('click', loadSlideshow);
    pageButton.addEventListener('click', loadPage);

    // Initial load: Display the slideshow by default when the page loads
    loadSlideshow();
    // Set up slideshow navigation
    setupSlideshowNavigation();
});
