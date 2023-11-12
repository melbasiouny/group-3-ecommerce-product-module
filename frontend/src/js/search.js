document.addEventListener("DOMContentLoaded", function () {
    const category_button = document.getElementById("category_button");
    const search_button = document.getElementById("search_button");
    const search_status = document.getElementById("search_status");
    const search_query = document.getElementById("search_query");
    const query_string = window.location.search;
    const url_params = new URLSearchParams(query_string);
    const category = url_params.get('category');
    const query = url_params.get('query');

    if (category == "") {
        category_button.textContent = "All";
    } else {
        category_button.textContent = category;
    }

    function query_products(query) {
        return fetch(`http://172.105.25.146:8080/api/product?category=${category}&search=${query}`)
            .then(response => response.json())
            .catch(error => {
                window.location.href = '404.html';
                console.error("Error fetching products: ", error);
                return [];
            });
    }

    function display_products(query) {
        query_products(query)
            .then(products => {
                product_container.innerHTML = "";

                products.forEach(product => {
                    const is_low_stock = product.stock <= 10;
                    const product_html =
                        `<div class="product rounded" style="margin-bottom: 40px; margin-left: 10px; margin-right: 10px; margin-top: 10px; width: 180px; height: auto; position: relative; overflow: hidden;" data-product-id="${product.pid}" onmouseover="this.style.boxShadow='inset 0 0 8px 1px rgba(81, 92, 255, 0.16), 0 0 16px 4px rgba(81, 157, 255, 0.16)'; this.style.transform='scale(1.05)';" onmouseout="this.style.boxShadow='none'; this.style.transform='scale(1)';">
                            <img class="rounded" style="padding: 12px; object-fit: contain; margin-bottom: 0px;" src="${product.image}" width="180" height="120">
                            <div class="rating" style="position: absolute; top: 0px; right: 6px;">
                                <span style="color: black; font-weight: bold; font-size: 14px;">${product.rating}</span>
                            <i class="bi bi-star-fill"></i>
                            </div>
                            <div class="text-uppercase fw-bold product-name" style="padding-left: 4px; padding-right: 4px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; white-space: normal; text-overflow: ellipsis; overflow-wrap: break-word; z-index: 2;">
                                ${is_low_stock ? '<i class="bi bi-exclamation-circle-fill"></i>' : ''}
                                ${product.name}
                            </div>
                            <div class="product-price" style="padding-left: 4px; padding-right: 4px; z-index: 2;">C$ ${product.price}</div>
                        </div>`;

                    product_container.innerHTML += product_html;
                });

                if (products.length > 0) {
                    if (query == "") {
                        search_status.textContent = "Showing all results in " + category.toLowerCase();
                    } else {
                        if (category == "") {
                            search_status.textContent = "Showing all results for \"" + query + "\"";
                        } else {
                            search_status.textContent = "Showing results for \"" + query + "\"" + " in " + category.toLowerCase();
                        }
                    }
                } else {
                    search_status.textContent = "No products found for \"" + query + "\"";
                }

                product_container.addEventListener('click', function (event) {
                    const product_element = event.target.closest('.product');
                    if (product_element) {
                        const product_ID = product_element.getAttribute('data-product-id');
                        go_to_product(product_ID);
                    }
                });
            });
    }

    function go_to_product(product_id) {
        const request_options = {
            method: 'POST',
        };

        fetch(`http://172.105.25.146:8080/api/analytics/${product_id}/clicks/increment`, request_options)
            .then(response => {
                if (!response.ok) {
                    console.error('Error incrementing clicks for pid:', product_id);
                }
            })
            .catch(error => {
                console.error('Error while sending POST request:', error);
            });

        window.location.href = 'detailed-view.html?product=' + encodeURIComponent(product_id);
    }

    search_button.addEventListener("click", (event) => {
        event.preventDefault();

        if (category_button.textContent == "All") {
            if (search_query.value == "") {
                window.location.href = 'index.html?page=1';
            } else {
                window.location.href = 'product-search.html?category=' + encodeURIComponent('') + '&query=' + encodeURIComponent(search_query.value);
            }
        } else {
            window.location.href = 'product-search.html?category=' + encodeURIComponent(category_button.textContent) + '&query=' + encodeURIComponent(search_query.value);
        }
    });

    display_products(query);
});