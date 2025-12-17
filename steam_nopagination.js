z// ==UserScript==
// @name         Steam Workshop Load All Items
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Load all items on Steam Workshop browse page to remove pagination
// @author       You
// @match        https://steamcommunity.com/workshop/browse/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to load all pages
    function loadAllPages() {
        // Find the pagination div
        const pagination = document.querySelector('.workshopBrowsePaging');
        if (!pagination) {
            alert('Pagination not found');
            return;
        }

        // Get total pages
        let maxPage = 1;
        const links = pagination.querySelectorAll('a');
        links.forEach(a => {
            const p = parseInt(a.textContent.trim());
            if (!isNaN(p) && p > maxPage) maxPage = p;
        });

        // Also check for numbers in text
        const text = pagination.textContent;
        const matches = text.match(/\d+/g);
        if (matches) {
            matches.forEach(num => {
                const p = parseInt(num);
                if (p > maxPage) maxPage = p;
            });
        }

        if (maxPage <= 1) {
            alert('Only one page');
            return;
        }

        // Hide pagination
        pagination.style.display = 'none';

        // Get items container
        const container = document.querySelector('.workshopBrowseItems');
        if (!container) {
            alert('Items container not found');
            return;
        }

        // Disable button
        const button = document.getElementById('loadAllButton');
        if (button) button.disabled = true;
        button.textContent = 'Loading...';

        // Load pages 2 to maxPage with delay to avoid rate limit
        let currentPage = 2;
        const loadNext = () => {
            if (currentPage > maxPage) {
                button.textContent = 'All Loaded';
                return;
            }
            fetchPage(currentPage, container, () => {
                currentPage++;
                setTimeout(loadNext, 500); // 500ms delay
            });
        };
        loadNext();
    }

    // Function to fetch a page and append items
    function fetchPage(page, container, callback) {
        const url = window.location.href + (window.location.search ? '&' : '?') + 'p=' + page;
        fetch(url)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const items = doc.querySelectorAll('.workshopItem');
                items.forEach(item => {
                    container.appendChild(item.cloneNode(true));
                });
                callback();
            })
            .catch(err => {
                console.error('Error loading page', page, err);
                callback();
            });
    }

    // Add button on page load
    window.addEventListener('load', function() {
        const pagination = document.querySelector('.workshopBrowsePaging');
        if (!pagination) return;

        const button = document.createElement('button');
        button.id = 'loadAllButton';
        button.textContent = 'Load All Items';
        button.style.margin = '10px';
        button.style.padding = '10px';
        button.onclick = loadAllPages;

        // Insert before pagination
        pagination.parentNode.insertBefore(button, pagination);
    });

})();