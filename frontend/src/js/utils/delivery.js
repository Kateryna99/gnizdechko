import {setUiSelectDisabled, renderOptions} from './init-dropdown.js'

const citiesCache = new Map()
const citiesCacheKey = (country, carrier, q) =>
    `${country}|${carrier}|${q}`

const warehousesCache = new Map()

const warehousesCacheKey = (country, carrier, cityId, q) =>
    `${country}|${carrier}|${cityId}|${q}`

const qs = (root, sel) => root.querySelector(sel)

const apiGet = (() => {
    let controller = null

    return async (url) => {
        if (controller) controller.abort()
        controller = new AbortController()

        const res = await fetch(url, {
            headers: {'X-Requested-With': 'XMLHttpRequest'},
            signal: controller.signal,
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
    }
})()

const getEndpoints = (deliveryEl) => ({
    carriers: deliveryEl?.dataset?.urlCarriers || '/api/delivery/carriers/',
    cities: deliveryEl?.dataset?.urlCities || '/api/delivery/cities/',
    warehouses: deliveryEl?.dataset?.urlWarehouses || '/api/delivery/warehouses/',
})

const getCountry = (deliveryEl, root = document) => {
    const countrySelect =
        qs(deliveryEl, '[data-country-select]') || qs(root, '[data-country-select]')
    return countrySelect?.querySelector('input[type="hidden"]')?.value || 'UA'
}

const getCarrier = (carriersEl) => {
    return (
        carriersEl?.querySelector('input[type="radio"][name="delivery_carrier"]:checked')?.value || ''
    )
}

const getHiddenValue = (selectEl) => {
    return selectEl?.querySelector('input[type="hidden"]')?.value || ''
}

const setCarriersDisabled = (carriersEl, disabled) => {
    if (!carriersEl) return

    carriersEl.classList.toggle('delivery__carriers--disabled', Boolean(disabled))

    carriersEl.querySelectorAll('input[type="radio"][name="delivery_carrier"]').forEach(r => {
        r.disabled = Boolean(disabled)
        if (disabled) r.checked = false
    })
}

const renderCarriers = (carriersEl, carriers = []) => {
    if (!carriersEl) return

    const iconNp = carriersEl.dataset.iconNp || '/static/images/icons/nova-poshta.svg'
    const iconUp = carriersEl.dataset.iconUp || '/static/images/icons/ukrposhta.svg'

    const map = {
        np: {icon: iconNp, label: 'Нова Пошта'},
        up: {icon: iconUp, label: 'Укрпошта'},
    }

    carriersEl.innerHTML = carriers.length
        ? carriers.map(c => {
            const code = c.id
            const meta = map[code] || {icon: '', label: c.name}

            return `
          <label class="delivery-carrier">
            <input class="delivery-carrier__radio" type="radio" name="delivery_carrier" value="${code}">
            <span class="delivery-carrier__control" aria-hidden="true"></span>
            <span class="delivery-carrier__icon" aria-hidden="true">
              ${meta.icon ? `<img src="${meta.icon}" alt="">` : ``}
            </span>
            <span class="delivery-carrier__text">${meta.label}</span>
          </label>
        `
        }).join('')
        : `<div class="delivery__empty">Доставка недоступна</div>`
}

const ensureDefaultCarrierForUA = (carriersEl) => {
    const np = carriersEl?.querySelector('input[type="radio"][name="delivery_carrier"][value="np"]')
    if (np) np.checked = true
}

export const initDeliveryStep1CountryToCarriers = (root = document) => {
    const deliveryEl = qs(root, '[data-delivery]')
    if (!deliveryEl) return

    const endpoints = getEndpoints(deliveryEl)

    const countrySelect =
        qs(deliveryEl, '[data-country-select]') || qs(root, '[data-country-select]')
    const carriersEl = qs(deliveryEl, '[data-carriers]')
    const citySelect = qs(deliveryEl, '[data-city-select]')
    const warehouseSelect = qs(deliveryEl, '[data-warehouse-select]')

    if (!countrySelect || !carriersEl) return

    const resetCityWarehouse = (cityText, whText) => {
        setUiSelectDisabled(citySelect, true, cityText, cityText)
        setUiSelectDisabled(warehouseSelect, true, whText, whText)
    }

    const toggleUaIntl = (country) => {
        const uaBlock = deliveryEl.querySelector('[data-delivery-ua]')
        const intlBlock = deliveryEl.querySelector('[data-delivery-intl]')
        if (!uaBlock || !intlBlock) return

        const isUA = country === 'UA'
        uaBlock.hidden = !isUA
        intlBlock.hidden = isUA
    }

    const applyCountryState = async (country) => {
        toggleUaIntl(country)

        if (country !== 'UA') {
            setCarriersDisabled(carriersEl, true)
            renderCarriers(carriersEl, [])
            resetCityWarehouse('Доставка недоступна', 'Доставка недоступна')
            return
        }

        resetCityWarehouse('Оберіть службу доставки', 'Спочатку оберіть місто')

        setCarriersDisabled(carriersEl, true)
        renderCarriers(carriersEl, [])

        try {
            const data = await apiGet(`${endpoints.carriers}?country=${encodeURIComponent(country)}`)

            if (!data?.ok) throw new Error(data?.error || 'API error')

            const carriers = data?.items || []

            renderCarriers(carriersEl, carriers)

            const hasAny = carriers.length
            setCarriersDisabled(carriersEl, !hasAny)

            if (hasAny) {
                ensureDefaultCarrierForUA(carriersEl)
                setUiSelectDisabled(citySelect, false, 'Оберіть місто', 'Почніть вводити назву')

                carriersEl.dispatchEvent(new Event('change', {bubbles: true}))
            }
        } catch (e) {
            if (e.name === 'AbortError') return
            setCarriersDisabled(carriersEl, true)
            renderCarriers(carriersEl, [])
            resetCityWarehouse('Доставка недоступна', 'Доставка недоступна')
            console.log(e)
        }
    }

    const initialCountry = getCountry(deliveryEl, root)
    applyCountryState(initialCountry)

    countrySelect.addEventListener('ui-select:change', (e) => {
        const country = e.detail?.value || ''
        if (!country) return
        applyCountryState(country)
    })
}

const bindCityToWarehouses = (deliveryEl, root = document) => {
    const endpoints = getEndpoints(deliveryEl)

    const carriersEl = qs(deliveryEl, '[data-carriers]')
    const citySelect = qs(deliveryEl, '[data-city-select]')
    const warehouseSelect = qs(deliveryEl, '[data-warehouse-select]')
    if (!carriersEl || !citySelect || !warehouseSelect) return

    const loadWarehouses = async ({country, carrier, cityId, q = ''}) => {
        if (!country || !carrier || !cityId) {
            setUiSelectDisabled(warehouseSelect, true, 'Спочатку оберіть місто', 'Спочатку оберіть місто')
            return
        }

        const key = warehousesCacheKey(country, carrier, cityId, q)

        if (warehousesCache.has(key)) {
            setUiSelectDisabled(
                warehouseSelect,
                false,
                'Оберіть відділення',
                'Нічого не знайдено'
            )
            renderOptions(warehouseSelect, warehousesCache.get(key), 'Нічого не знайдено')
            return
        }

        renderOptions(warehouseSelect, [], 'Завантаження...')

        try {
            const data = await apiGet(
                `${endpoints.warehouses}?country=${encodeURIComponent(country)}&carrier=${encodeURIComponent(
                    carrier
                )}&city_id=${encodeURIComponent(cityId)}&q=${encodeURIComponent(q)}`
            )

            const items = (data?.items || []).map(w => ({id: w.id, name: w.name}))

            warehousesCache.set(key, items)

            setUiSelectDisabled(warehouseSelect, false, 'Оберіть відділення', 'Нічого не знайдено')
            renderOptions(warehouseSelect, items, 'Нічого не знайдено')
        } catch (e) {
            if (e.name === 'AbortError') return
            setUiSelectDisabled(warehouseSelect, true, 'Помилка завантаження', 'Помилка завантаження')
            console.log(e)
        }
    }

    citySelect.addEventListener('ui-select:change', (e) => {
        const country = getCountry(deliveryEl, root)
        const carrier = getCarrier(carriersEl)
        const cityId = e.detail?.value || ''

        setUiSelectDisabled(warehouseSelect, true, 'Оберіть відділення', 'Оберіть відділення')
        if (!cityId || !carrier) return

        loadWarehouses({country, carrier, cityId})
    })

    carriersEl.addEventListener('change', () => {
        const country = getCountry(deliveryEl, root)
        const carrier = getCarrier(carriersEl)
        const cityId = getHiddenValue(citySelect)

        setUiSelectDisabled(warehouseSelect, true, 'Оберіть відділення', 'Оберіть відділення')
        if (!carrier || !cityId) return

        loadWarehouses({country, carrier, cityId})
    })

    warehouseSelect.addEventListener('ui-select:search', (e) => {
        const q = e.detail?.query || ''
        const country = getCountry(deliveryEl, root)
        const carrier = getCarrier(carriersEl)
        const cityId = getHiddenValue(citySelect)

        if (!carrier || !cityId) return
        loadWarehouses({country, carrier, cityId, q})
    })
}

const bindSearchForCities = (deliveryEl, root = document) => {
    const endpoints = getEndpoints(deliveryEl)

    const carriersEl = qs(deliveryEl, '[data-carriers]')
    const citySelect = qs(deliveryEl, '[data-city-select]')
    const warehouseSelect = qs(deliveryEl, '[data-warehouse-select]')
    if (!carriersEl || !citySelect || !warehouseSelect) return

    const loadCities = async ({country, carrier, q = ''}) => {
        if (!country || !carrier) return

        const key = citiesCacheKey(country, carrier, q)

        if (citiesCache.has(key)) {
            renderOptions(citySelect, citiesCache.get(key), 'Нічого не знайдено')
            return
        }

        renderOptions(citySelect, [], 'Завантаження...')

        try {
            const data = await apiGet(
                `${endpoints.cities}?country=${encodeURIComponent(country)}&carrier=${encodeURIComponent(
                    carrier
                )}&q=${encodeURIComponent(q)}`
            )

            const items = (data?.items || []).map(c => ({
                id: c.id,
                name: c.name,
            }))

            citiesCache.set(key, items)
            renderOptions(citySelect, items, 'Нічого не знайдено')
        } catch (e) {
            if (e.name === 'AbortError') return
            console.log(e)
            setUiSelectDisabled(citySelect, true, 'Помилка завантаження', 'Помилка завантаження')
        }
    }

    citySelect.addEventListener('ui-select:search', (e) => {
        const q = e.detail?.query || ''
        const country = getCountry(deliveryEl, root)
        const carrier = getCarrier(carriersEl)

        if (!carrier) return

        setUiSelectDisabled(warehouseSelect, true, 'Спочатку оберіть місто', 'Спочатку оберіть місто')
        loadCities({country, carrier, q})
    })
}

export const initDeliveryStep3CityToWarehouses = (root = document) => {
    const deliveryEl = qs(root, '[data-delivery]')
    if (!deliveryEl) return

    bindCityToWarehouses(deliveryEl, root)
    bindSearchForCities(deliveryEl, root)
}

export const initDeliveryStep4CarrierToCities = (root = document) => {
    const deliveryEl = qs(root, '[data-delivery]')
    if (!deliveryEl) return

    const endpoints = getEndpoints(deliveryEl)

    const carriersEl = qs(deliveryEl, '[data-carriers]')
    const citySelect = qs(deliveryEl, '[data-city-select]')
    const warehouseSelect = qs(deliveryEl, '[data-warehouse-select]')
    if (!carriersEl || !citySelect || !warehouseSelect) return

    const loadCities = async (country, carrier, q = '') => {
        if (!country || !carrier) return

        renderOptions(citySelect, [], 'Завантаження...')
        setUiSelectDisabled(warehouseSelect, true, 'Спочатку оберіть місто', 'Спочатку оберіть місто')

        try {
            const data = await apiGet(
                `${endpoints.cities}?country=${encodeURIComponent(country)}&carrier=${encodeURIComponent(
                    carrier
                )}&q=${encodeURIComponent(q)}`
            )

            const items = (data?.items || []).map(c => ({id: c.id, name: c.name}))

            setUiSelectDisabled(citySelect, false, 'Оберіть місто', 'Нічого не знайдено')
            renderOptions(citySelect, items, 'Нічого не знайдено')
        } catch (e) {
            setUiSelectDisabled(citySelect, true, 'Помилка завантаження', 'Помилка завантаження')
            console.log(e)
        }
    }

    carriersEl.addEventListener('change', () => {
        const country = getCountry(deliveryEl, root)
        const carrier = getCarrier(carriersEl)

        setUiSelectDisabled(citySelect, false, 'Завантаження...', 'Завантаження...')
        setUiSelectDisabled(warehouseSelect, true, 'Спочатку оберіть місто', 'Спочатку оберіть місто')

        if (!carrier) return
        loadCities(country, carrier)
    })

    const initialCountry = getCountry(deliveryEl, root)
    const initialCarrier = getCarrier(carriersEl)

    if (initialCountry === 'UA' && initialCarrier) {
        loadCities(initialCountry, initialCarrier)
    } else {
        setUiSelectDisabled(citySelect, true, 'Оберіть службу доставки', 'Оберіть службу доставки')
        setUiSelectDisabled(warehouseSelect, true, 'Спочатку оберіть місто', 'Спочатку оберіть місто')
    }
}