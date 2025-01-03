// Initialize Supabase client
const supabaseUrl = 'https://lajkfqyqdirlobqldpmf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhamtmcXlxZGlybG9icWxkcG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDUyMjIsImV4cCI6MjA1MTQyMTIyMn0.gNOpQcoNfdzMCl6FtrP49KTANFrHN4PziwSd6btoC_o'
window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    // Wait for DOM to load
    // Loader Screen
    const loader = document.querySelector('.loader-wrapper');

    // Disable scrolling while loader is visible
    document.body.style.overflow = 'hidden';

    // Hide loader after a delay
    setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
            document.body.classList.add('loaded');
            document.body.style.overflow = '';
        }, 500);
    }, 2000);

    // Initialize all functionality
    initSlideshow();
    initMobileMenu();
    initDonationForm();

    // Header scroll effect
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                updateActiveLink(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    function updateActiveLink(sectionId) {
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${sectionId}`) {
                item.classList.add('active');
            }
        });
    }

    // Hover effect for nav items
    const navContainer = document.querySelector('.nav-container');
    
    navContainer.addEventListener('mousemove', (e) => {
        const items = document.querySelectorAll('.nav-item');
        const mouseX = e.clientX;

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemX = rect.left + (rect.width / 2);
            const distance = Math.abs(mouseX - itemX);
            const scale = Math.max(0.8, 1 - (distance / 500));
            
            item.style.transform = `scale(${scale})`;
        });
    });

    navContainer.addEventListener('mouseleave', () => {
        const items = document.querySelectorAll('.nav-item');
        items.forEach(item => {
            item.style.transform = 'scale(1)';
        });
    });

    // About Section Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding pane
            const targetPane = document.getElementById(`${button.dataset.tab}-pane`);
            targetPane.classList.add('active');
        });
    });

    // Counter Animation
    const counters = document.querySelectorAll('.counter');
    let hasStarted = false;

    function startCounting() {
        if (hasStarted) return;
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60 FPS
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target + '+';
                }
            };

            updateCounter();
        });

        hasStarted = true;
    }

    // Start counting when the section is in view
    const observerCounter = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounting();
            }
        });
    }, { threshold: 0.5 });

    const achievementList = document.querySelector('.achievement-list');
    if (achievementList) {
        observerCounter.observe(achievementList);
    }

    // Donation Popup Functionality
    const donationPopup = document.getElementById('donationPopup');
    const donateButtons = document.querySelectorAll('a[href="#volunteer"]');

    // Open popup when any donate button is clicked
    donateButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            donationPopup.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    // Close popup when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === donationPopup) {
            donationPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Slideshow functionality
    function initSlideshow() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.slide-dot');
        let currentSlide = 0;
        let isAnimating = false;
        let slideInterval;

        function updateSlides(newIndex) {
            if (isAnimating || newIndex === currentSlide) return;
            isAnimating = true;

            // Remove all classes
            slides.forEach(slide => slide.classList.remove('active', 'prev', 'next'));
            dots.forEach(dot => dot.classList.remove('active'));

            // Calculate prev and next indices
            const prevIndex = (newIndex - 1 + slides.length) % slides.length;
            const nextIndex = (newIndex + 1) % slides.length;

            // Add appropriate classes
            slides[prevIndex].classList.add('prev');
            slides[newIndex].classList.add('active');
            slides[nextIndex].classList.add('next');
            dots[newIndex].classList.add('active');

            // Update current slide
            currentSlide = newIndex;

            // Reset animation lock
            setTimeout(() => isAnimating = false, 800);
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            updateSlides(nextIndex);
        }

        function prevSlide() {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            updateSlides(prevIndex);
        }

        function startSlideshow() {
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 2000);
        }

        // Click handlers for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateSlides(index);
                startSlideshow();
            });
        });

        // Touch handling
        const slideshowContainer = document.querySelector('.slideshow-container');
        let touchStartY = 0;
        let touchEndY = 0;

        slideshowContainer.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        slideshowContainer.addEventListener('touchmove', (e) => {
            touchEndY = e.touches[0].clientY;
        }, { passive: true });

        slideshowContainer.addEventListener('touchend', () => {
            const touchDiff = touchStartY - touchEndY;
            if (Math.abs(touchDiff) > 50) {
                if (touchDiff > 0) {
                    nextSlide(); // Swipe up
                } else {
                    prevSlide(); // Swipe down
                }
                startSlideshow();
            }
        });

        // Mouse wheel navigation
        slideshowContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY > 0) {
                nextSlide(); // Scroll down
            } else {
                prevSlide(); // Scroll up
            }
            startSlideshow();
        }, { passive: false });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                startSlideshow();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                startSlideshow();
            }
        });

        // Pause on hover
        slideshowContainer.addEventListener('mouseenter', () => {
            if (slideInterval) clearInterval(slideInterval);
        });

        slideshowContainer.addEventListener('mouseleave', startSlideshow);

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (slideInterval) clearInterval(slideInterval);
            } else {
                startSlideshow();
            }
        });

        // Initialize first slide and start slideshow
        updateSlides(0);
        startSlideshow();
    }

    // Mobile menu functionality
    function initMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const navLinks = document.querySelector('.nav-links');
        const navItems = document.querySelectorAll('.nav-item');
        let isOpen = false;

        mobileMenu.addEventListener('click', () => {
            isOpen = !isOpen;
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (isOpen) {
                    isOpen = false;
                    mobileMenu.classList.remove('active');
                    navLinks.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }

    // Donation Form Initialization
    function initDonationForm() {
        const donationForm = document.getElementById('donationForm');
        const donationPopup = document.getElementById('donationPopup');
        const closePopup = document.querySelector('.close-popup');

        // Close popup when clicking the close button
        if (closePopup) {
            closePopup.addEventListener('click', () => {
                donationPopup.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        // Close popup when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === donationPopup) {
                donationPopup.style.display = 'none';
                document.body.style.overflow = '';
            }
        });

        // Handle donation form submission
        if (donationForm) {
            donationForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                setFormLoading(donationForm, true);

                try {
                    // Get form data
                    const formData = {
                        name: document.getElementById('donorName').value,
                        amount: parseFloat(document.getElementById('donationAmount').value),
                        phone: document.getElementById('donorPhone').value,
                        transaction_id: document.getElementById('transactionId').value,
                        status: 'pending'
                    };

                    // Validate phone number
                    if (!formData.phone.match(/^[0-9]{10}$/)) {
                        throw new Error('Please enter a valid 10-digit phone number');
                    }

                    // Validate amount
                    if (formData.amount <= 0) {
                        throw new Error('Please enter a valid donation amount');
                    }

                    console.log('Sending data to Supabase:', formData);

                    // Send data to Supabase
                    const { data, error } = await window.supabase
                        .from('donations')
                        .insert([formData]);

                    if (error) {
                        console.error('Supabase Error:', error);
                        throw error;
                    }

                    console.log('Supabase Response:', data);

                    // Show success message
                    showNotification('Thank you for your donation!', false);

                    // Clear form and close popup
                    donationForm.reset();
                    donationPopup.style.display = 'none';
                    document.body.style.overflow = ''; // Restore scrolling

                } catch (error) {
                    console.error('Error:', error);
                    showNotification(error.message || 'Failed to submit donation. Please try again.', true);
                } finally {
                    setFormLoading(donationForm, false);
                }
            });
        }
    }

    // Smooth scroll for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Initialize World Map
    google.charts.load('current', {
        'packages': ['geochart']
    });

    google.charts.setOnLoadCallback(drawMap);

    function drawMap() {
        var data = google.visualization.arrayToDataTable([
            ['Country', 'Selected', { role: 'tooltip' }],
            ['IN', 1, 'India'],
            ['TH', 1, 'Thailand'],
            ['MY', 1, 'Malaysia'],
            ['ID', 1, 'Indonesia'],
            ['CA', 1, 'Canada'],
            ['FR', 1, 'France']
        ]);

        function getMapOptions() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            return {
                backgroundColor: isDark ? '#1a1a1a' : 'transparent',
                colorAxis: {
                    minValue: 0,
                    maxValue: 1,
                    colors: isDark ? ['#2d2d2d', '#00bfb3'] : ['#f0f0f0', '#00bfb3']
                },
                legend: 'none',
                datalessRegionColor: isDark ? '#2d2d2d' : '#f0f0f0',
                tooltip: {
                    trigger: 'focus',
                    isHtml: true,
                    textStyle: {
                        color: '#ffffff',
                        fontSize: 14,
                        fontName: 'Cabinet Grotesk'
                    }
                },
                keepAspectRatio: true,
                width: '100%',
                height: '100%',
                backgroundColor: {
                    fill: isDark ? '#1a1a1a' : 'transparent',
                    stroke: 'none',
                    strokeWidth: 0
                },
                displayMode: 'regions',
                enableRegionInteractivity: true,
                region: 'world',
                magnifyingGlass: {
                    enable: true,
                    zoomFactor: 7.5
                }
            };
        }

        var container = document.getElementById('world-map');
        var chart = new google.visualization.GeoChart(container);

        // Remove unwanted elements after map is drawn
        google.visualization.events.addListener(chart, 'ready', function() {
            var svg = container.getElementsByTagName('svg')[0];
            if (svg) {
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                var texts = svg.getElementsByTagName('text');
                for (var i = texts.length - 1; i >= 0; i--) {
                    var text = texts[i];
                    if (text.textContent.includes('Geochart') || 
                        text.textContent.includes('Google') ||
                        text.textContent.includes('Map') ||
                        text.textContent.includes('Selected:')) {
                        text.remove();
                    }
                }
            }
        });

        // Initial draw
        chart.draw(data, getMapOptions());

        // Update map when theme changes
        const themeObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'data-theme') {
                    chart.draw(data, getMapOptions());
                }
            });
        });

        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Make the chart responsive
        window.addEventListener('resize', function() {
            chart.draw(data, getMapOptions());
        });
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted'); // Debug log
            
            const formData = new FormData(contactForm);
            const formDataObj = {
                name: formData.get('name'),
                email: formData.get('email'),
                phonenumber: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            console.log('Form data:', formDataObj); // Debug log
            
            try {
                setFormLoading(contactForm, true);

                // First, create the contact record
                const { data, error } = await window.supabase
                    .from('contact')
                    .insert([formDataObj]);

                if (error) {
                    console.error('Supabase error:', error); // Debug log
                    throw error;
                }

                console.log('Submission successful:', data); // Debug log
                showNotification('Thank you for your message! We will get back to you soon.', false);
                contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                showNotification('There was an error sending your message. Please try again.', true);
            } finally {
                setFormLoading(contactForm, false);
            }
        });
    }

    // Team Modal
    const teamButton = document.querySelector('a[href="#team"]');
    const teamModal = document.getElementById('teamModal');
    if (teamButton && teamModal) {
        const closeTeamModal = teamModal.querySelector('.close-modal');

        teamButton.addEventListener('click', function(e) {
            e.preventDefault();
            teamModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        if (closeTeamModal) {
            closeTeamModal.addEventListener('click', function() {
                teamModal.classList.remove('show');
                document.body.style.overflow = '';
            });
        }

        // Close modal when clicking outside
        teamModal.addEventListener('click', function(e) {
            if (e.target === teamModal) {
                teamModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && teamModal.classList.contains('show')) {
                teamModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    // Testimonial Slider
    const sliderTrack = document.querySelector('.slider-track');
    const prevButton = document.querySelector('.slider-arrow.prev');
    const nextButton = document.querySelector('.slider-arrow.next');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    if (sliderTrack && testimonialCards.length > 0) {
        let currentIndex = 0;

        function getVisibleCards() {
            if (window.innerWidth >= 1200) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        }

        function updateSlider() {
            const cardWidth = testimonialCards[0].offsetWidth;
            const margin = 32; // 2rem margin
            const offset = -(currentIndex * (cardWidth + margin));
            sliderTrack.style.transform = `translateX(${offset}px)`;

            // Update button states
            const maxIndex = testimonialCards.length - getVisibleCards();
            if (prevButton) {
                prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
                prevButton.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
            }
            if (nextButton) {
                nextButton.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
                nextButton.style.cursor = currentIndex >= maxIndex ? 'not-allowed' : 'pointer';
            }
        }

        function slideNext() {
            const maxIndex = testimonialCards.length - getVisibleCards();
            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        }

        function slidePrev() {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        }

        if (nextButton) {
            nextButton.addEventListener('click', slideNext);
        }
        if (prevButton) {
            prevButton.addEventListener('click', slidePrev);
        }

        // Update slider on window resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                currentIndex = Math.min(currentIndex, testimonialCards.length - getVisibleCards());
                updateSlider();
            }, 100);
        });

        // Initialize slider
        updateSlider();

        // Optional: Auto slide every 5 seconds
        setInterval(() => {
            const maxIndex = testimonialCards.length - getVisibleCards();
            if (currentIndex >= maxIndex) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            updateSlider();
        }, 5000);
    }

    // Video Modal
    const videoButton = document.getElementById('videoButton');
    const videoModal = document.getElementById('videoModal');
    if (videoButton && videoModal) {
        const closeModal = videoModal.querySelector('.close-modal');
        const iframe = videoModal.querySelector('.video-container iframe');

        videoButton.addEventListener('click', function(e) {
            e.preventDefault();
            videoModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        if (closeModal) {
            closeModal.addEventListener('click', function() {
                videoModal.classList.remove('show');
                document.body.style.overflow = '';
                if (iframe) {
                    const src = iframe.src;
                    iframe.src = '';
                    iframe.src = src;
                }
            });
        }

        // Close modal when clicking outside
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                videoModal.classList.remove('show');
                document.body.style.overflow = '';
                if (iframe) {
                    const src = iframe.src;
                    iframe.src = '';
                    iframe.src = src;
                }
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal.classList.contains('show')) {
                videoModal.classList.remove('show');
                document.body.style.overflow = '';
                if (iframe) {
                    const src = iframe.src;
                    iframe.src = '';
                    iframe.src = src;
                }
            }
        });
    }

    // Supabase Configuration
    const SUPABASE_URL = 'https://lajkfqyqdirlobqldpmf.supabase.co'
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhamtmcXlxZGlybG9icWxkcG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDUyMjIsImV4cCI6MjA1MTQyMTIyMn0.gNOpQcoNfdzMCl6FtrP49KTANFrHN4PziwSd6btoC_o'
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Form Submission Handlers
    document.addEventListener('DOMContentLoaded', function() {
        // Contact Form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                console.log('Form submitted'); // Debug log
                
                const formData = new FormData(contactForm);
                const formDataObj = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phonenumber: formData.get('phone'),
                    subject: formData.get('subject'),
                    message: formData.get('message')
                };
                
                console.log('Form data:', formDataObj); // Debug log
                
                try {
                    setFormLoading(contactForm, true);
                    const { data, error } = await window.supabase
                        .from('contact')
                        .insert([formDataObj]);

                    if (error) {
                        console.error('Supabase error:', error); // Debug log
                        throw error;
                    }

                    console.log('Submission successful:', data); // Debug log
                    showNotification('Thank you for your message! We will get back to you soon.', false);
                    contactForm.reset();
                } catch (error) {
                    console.error('Error:', error);
                    showNotification('There was an error sending your message. Please try again.', true);
                } finally {
                    setFormLoading(contactForm, false);
                }
            });
        }

        // Donation Form
        const donationForm = document.querySelector('.donation-form');
        if (donationForm) {
            donationForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(donationForm);
                
                try {
                    setFormLoading(donationForm, true);

                    // First, create the donation record
                    const { data: donationData, error: donationError } = await window.supabase
                        .from('donations')
                        .insert([{
                            name: formData.get('name'),
                            email: formData.get('email'),
                            message: formData.get('message')
                        }])
                        .select()
                        .single();

                    if (donationError) throw donationError;

                    // Generate a unique transaction ID
                    const transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                    // Then create the donation details record
                    const { data: detailsData, error: detailsError } = await window.supabase
                        .from('donation_details')
                        .insert([{
                            donation_id: donationData.id,
                            amount: parseFloat(formData.get('amount')),
                            phone_number: formData.get('phone'),
                            transaction_id: transactionId,
                            payment_status: 'pending'
                        }]);

                    if (detailsError) throw detailsError;

                    showNotification('Thank you for your donation! Your transaction ID is: ' + transactionId, false);
                    donationForm.reset();

                    // Here you would typically redirect to a payment gateway
                    // handlePayment(transactionId, formData.get('amount'));

                } catch (error) {
                    console.error('Error:', error);
                    showNotification('There was an error processing your donation. Please try again.', true);
                } finally {
                    setFormLoading(donationForm, false);
                }
            });
        }
    });

    // Add loading states to forms
    function setFormLoading(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
        }
    }

    // Show notification
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});

// Loading screen handler
window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 3500); // Wait for 3.5 seconds to show the complete animation
});
