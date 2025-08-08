// IdeaGenerator - Генератор идей для подарков
// -------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.idea-filter');
    const complexityInput = form.querySelector('input[name="complexity"]');
    const complexityType = form.querySelector('.complexity__type');



    // All - Рандомный выбор всех инпутов
    // ----------------------------------
    function setRandomRadio(name) {
        const inputs = form.querySelectorAll(`input[name="${name}"]`);
        const randomInput = inputs[Math.floor(Math.random() * inputs.length)];

        randomInput.checked = true;
        randomInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function setRandomRangeValue(input) {
        const min = Number(input.min);
        const max = Number(input.max);
        const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Проверяем, есть ли кастомный range (ссылка из input-range.js) для этого input
        const rangeContainer = input.closest('.complexity-input');
        if (rangeContainer && rangeContainer.customRange && typeof rangeContainer.customRange.setValue === 'function') {
            // Используем метод кастомного range
            rangeContainer.customRange.setValue(randomValue);
        } else {
            // Обычный input range
            input.value = randomValue;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    function randomizeInputs() {
        setRandomRadio('recipient');
        setRandomRangeValue(complexityInput);
        setRandomRadio('color');
        setRandomRadio('mood');
    }



    // Recipient - Печать текста по выбранному получателю
    // --------------------------------------------------
    let typingTimeout;
    const typingBlock = form.querySelector('.typing__text');

    const typingMessages = {
        'colleagues': 'Сканируем офисные будни',
        'partner': 'Запущена программа ROMANTIKA',
        'family': 'Уровень тепла настроен на 100%',
        'friends': 'Анализируем весёлые воспоминания'
    };

    function typeText(text) {
        clearTimeout(typingTimeout);
        typingBlock.innerHTML = '';
        let i = 0;
        
        function typeChar() {
            typingBlock.innerHTML = text.slice(0, i) + '<span class="cursor">|</span>';

            if (i < text.length) {
                i++;
                typingTimeout = setTimeout(typeChar, 50);
            } else {
                typingBlock.innerHTML = text + '<span class="cursor">|</span>';
            }
        }

        typeChar();
    }

    // Обработка изменения выбранного input
    function handleRecipientChange(value) {
        const message = typingMessages[value];
        message ? typeText(message) : typingBlock.innerHTML = '';
    }

    // Инициализация input получателя
    function initRecipients() {
        // Привязывание события изменения
        form.querySelectorAll('input[name="recipient"]').forEach(item => {
            item.addEventListener('change', () => handleRecipientChange(item.value));
        });

        // Показываем сообщение, если вариант уже выбран при загрузке
        const checkedRecipient = form.querySelector('input[name="recipient"]:checked');

        if (checkedRecipient) {
            handleRecipientChange(checkedRecipient.value);
        }
    }



    // Complexity - Отображение значения сложности высказывания
    // --------------------------------------------------------
    function updateComplexityType() {
        const value = Number(complexityInput.value);
        const result = value > 30 ? 'max' : 'min';
        
        complexityType.textContent = result;
    }

    // Привязывание событий для обновления сложности
    complexityInput.addEventListener('input', updateComplexityType);
    complexityInput.addEventListener('change', updateComplexityType);



    // Color - Смена цвета фона сразу после нажатия на любой вариант
    // -------------------------------------------------------------

    document.querySelectorAll('input[name="color"]').forEach(input => {
        input.addEventListener('change', function() {
            // Смена фона result-card
            document.querySelector('.result-card').style.background = `linear-gradient(180deg, ${this.value} 0%, ${this.value} 100%), var(--bg-result) center / cover no-repeat`;

            // Смена фона range-box на соответствующий SVG
            const rangeBox = document.querySelector('.range-box');

            if (rangeBox) {
                const colorToSvg = {
                    '#4798FF': 'range-1.svg',
                    '#A8FF82': 'range-2.svg',
                    '#9761DB': 'range-3.svg',
                    '#0DFDF2': 'range-4.svg'
                };

                const svgFile = colorToSvg[this.value] || 'range.svg';
                rangeBox.style.backgroundImage = `url('./img/${svgFile}')`;
            }
        });
    });



    // Отображение данных по заданным параметрам
    // -----------------------------------------
    const resultCard = document.querySelector('.result-card');
    const resultBtn = document.querySelectorAll('.result__button');
    const resultVideo = document.querySelector('.result__video');

    function showResultBlock(data) {
        const key = `${data.recipient}-${data.complexity}-${data.mood}`;
        const result = window.resultTexts[key] || window.resultTexts['default'] || {title: 'Ошибка', desc: 'Нет данных.', howTo: 'Нет данных.'};
        
        // Отображение блока результата
        const frontSide = resultCard.querySelector('.result-content__front');
        const backSide = resultCard.querySelector('.result-content__back');

        resultCard.style.display = 'flex';
        frontSide.classList.add('active');
        backSide.classList.remove('active');

        // Заполнение данных результата
        frontSide.querySelector('.result__title').innerHTML = result.title;
        frontSide.querySelector('.result__desc').innerHTML = result.desc;
        backSide.querySelector('.result__desc').innerHTML = result.howTo;
    }

    // Взаимодействие с внутренними кнопками результата
    resultBtn.forEach(button => 
        button.addEventListener('click', () => {
            resultCard.querySelector('.result-content__front').classList.toggle('active');
            resultCard.querySelector('.result-content__back').classList.toggle('active');
        })
    );



    // [Submit] - Сбор данных и вывод результата, отключение кнопки
    // ------------------------------------------------------------
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitDefaultText = submitBtn.textContent;

    function toggleSubmitBtn(isEnabled, text = submitDefaultText) {
        submitBtn.textContent = text;
        submitBtn.disabled = !isEnabled;
        submitBtn.classList.toggle('disabled', !isEnabled);
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const data = {
            recipient: form.recipient.value || null,
            complexity: complexityType.textContent,
            color: form.color.value || null,
            mood: form.mood.value || null
        };
        
        showResultBlock(data);
        toggleSubmitBtn(false, 'Поменяйте что-то в фильтрах');  // Кнопка not-allowed
        resultVideo.pause();   // Перекрытые видео на паузе
    });



    // [Input] - Ожидание изменения значения любого поля (кроме name="color", по нему фон обновляется сразу)
    // -------------------------------------------------
    form.querySelectorAll('input:not([name="color"])').forEach(input => {
        input.addEventListener('input', () => toggleSubmitBtn(true));
        input.addEventListener('change', () => toggleSubmitBtn(true));
    });
    


    // Инициализация при загрузке страницы
    // ------------------------------------
    initRecipients();
    updateComplexityType();
    randomizeInputs();

});