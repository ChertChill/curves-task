// InputRange - Кастомный слайдер для выбора значения
// --------------------------------------------------
class InputRange {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.range-track');     // Полоса слайдера
        this.thumb = container.querySelector('.range-thumb');     // Ползунок
        this.input = container.querySelector('.range-input');     // Скрытый input range
        this.rangeBox = container.querySelector('.range-box');    // Подсказка над ползунком (опционально)

        this.min = parseFloat(this.input.min || 0);               // Минимальное значение
        this.max = parseFloat(this.input.max || 100);             // Максимальное значение
        this.isHorizontal = window.innerWidth <= 768;             // true — горизонтальный слайдер (мобилка)

        this.isDragging = false;                                  // Флаг перетаскивания
        this.trackRect = null;                                    // Координаты трека

        // Привязка контекста к методам
        ['startDragging', 'stopDragging', 'handleMove', 'handleClick']
            .forEach(fn => this[fn] = this[fn].bind(this));

        // Доступ к экземпляру через container.customRange
        this.container.customRange = this;
        this.init();
    }

    // [Init] - Инициализация событий
    // ------------------------------
    init() {
        this.updateValue(parseFloat(this.input.value) || this.min);

        // Реакция на прямое изменение input
        this.input.addEventListener('input', e => this.updateValue(+e.target.value));

        // Старт перетаскивания (mousedown/touchstart) — по ползунку и по треку
        ['mousedown', 'touchstart'].forEach(evt => {
            this.thumb.addEventListener(evt, e => this.startDragging(this.getPoint(e)));
            this.track.addEventListener(evt, e => this.handleClick(this.getPoint(e)));
        });

        // Движение (mousemove/touchmove) — пока тянем
        ['mousemove', 'touchmove'].forEach(evt =>
            document.addEventListener(evt, e => this.isDragging && this.handleMove(this.getPoint(e)))
        );

        // Завершение перетаскивания (mouseup/touchend)
        ['mouseup', 'touchend'].forEach(evt =>
            document.addEventListener(evt, this.stopDragging)
        );
    }

    // [Coords] - Получение координат курсора/пальца
    // ---------------------------------------------
    getPoint(e) {
        const p = e.touches ? e.touches[0] : e;
        e.preventDefault?.(); // Чтобы не было скролла при перетаскивании на мобилке
        return { x: p.clientX || p.pageX, y: p.clientY || p.pageY };
    }

    // [Layout] - Размеры и полезная длина трека
    // -----------------------------------------
    getLayout() {
        const size = this.isHorizontal ? this.track.clientWidth : this.track.clientHeight;
        const thumbHalf = (this.isHorizontal ? this.thumb.clientWidth : this.thumb.clientHeight) / 2 || 14;
        return { size, thumbHalf, usable: Math.max(1, size - thumbHalf * 2) };
    }

    // [Drag Start] - Начало перетаскивания
    // ------------------------------------
    startDragging() {
        this.isDragging = true;
        this.trackRect = this.track.getBoundingClientRect();
        this.thumb.style.transition = 'none';
        if (this.rangeBox) this.rangeBox.style.transition = 'none';
    }

    // [Drag Stop] - Окончание перетаскивания
    // --------------------------------------
    stopDragging() {
        this.isDragging = false;
        this.thumb.style.transition = '';
        if (this.rangeBox) {
            this.rangeBox.style.transition = this.isHorizontal ? 'left 0.1s ease' : 'top 0.1s ease';
        }
    }

    // [Calc Value] - Расчёт значения по координатам
    // ---------------------------------------------
    calculateValue(coord) {
        if (!this.trackRect) this.trackRect = this.track.getBoundingClientRect();
        const { size, thumbHalf, usable } = this.getLayout();
        const rel = this.isHorizontal
            ? coord.x - this.trackRect.left
            : coord.y - this.trackRect.top;
        const clamped = Math.max(thumbHalf, Math.min(size - thumbHalf, rel));
        const percent = this.isHorizontal
            ? (clamped - thumbHalf) / usable * 100
            : 100 - (clamped - thumbHalf) / usable * 100;
        return this.percentToValue(percent);
    }

    // [Move] - Обновление при перетаскивании
    handleMove(coord) { this.updateValue(this.calculateValue(coord)); }

    // [Click] - Перемещение по клику на трек
    handleClick(coord) { this.updateValue(this.calculateValue(coord)); }

    // [Update] - Установка значения и позиционирование элементов
    // ----------------------------------------------------------
    updateValue(value) {
        value = Math.max(this.min, Math.min(this.max, +value));
        if (this.input.value == value) return;

        this.input.value = value;
        const percent = this.valueToPercent(value);
        const { size, thumbHalf, usable } = this.getLayout();
        const pos = this.isHorizontal
            ? (thumbHalf + (percent / 100) * usable) / size * 100
            : (thumbHalf + (1 - percent / 100) * usable) / size * 100;

        // Позиция ползунка
        Object.assign(this.thumb.style, this.isHorizontal
            ? { left: `${pos}%`, top: '50%', transform: 'translate(-50%, -50%)' }
            : { top: `${pos}%`, left: '50%', transform: 'translate(-50%, -50%)' });

        // Позиция rangeBox (если есть)
        if (this.rangeBox) Object.assign(this.rangeBox.style, this.isHorizontal
            ? { left: `calc(${pos}% - 2.5rem)`, top: '50%', transform: 'translate(-50%, -50%) rotate(90deg)' }
            : { top: `${pos}%`, left: '', transform: 'translateY(-50%)' });

        // Генерация событий input/change для синхронизации
        ['input', 'change'].forEach(evt =>
            this.input.dispatchEvent(new Event(evt, { bubbles: true }))
        );
    }

    // [API] - Установка значения извне
    setValue(v) { this.updateValue(v); }

    // [Utils] - Конвертация значения в %
    valueToPercent(v) { return (v - this.min) / (this.max - this.min) * 100; }

    // [Utils] - Конвертация % в значение
    percentToValue(p) { return this.min + (this.max - this.min) * (p / 100); }
}

// Инициализация при загрузке страницы
// -----------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const el = document.querySelector('.complexity-input');
    if (el) new InputRange(el);
});