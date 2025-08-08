// Обратка механики иконки "Поделиться"
// ------------------------------------
const shareIcon = document.querySelector('.share__icon');

if (shareIcon) {
    shareIcon.addEventListener('click', function () {
        const url = window.location.href;
        const title = document.title;

        // Если доступен Web Share API
        if (navigator.share) {
            navigator.share({
                title: title,
                url: url
            }).catch(() => {
                // Если пользователь отменил или произошла ошибка
            });
        } else {
            // Копировать ссылку в буфер обмена
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    alert('Ссылка скопирована!');
                }, () => {
                    alert('Не удалось скопировать ссылку');
                });
            } else {
                // Фоллбек для старых браузеров
                const tempInput = document.createElement('input');
                tempInput.value = url;

                document.body.appendChild(tempInput);
                tempInput.select();

                try {
                    document.execCommand('copy');
                    alert('Ссылка скопирована!');
                } catch (err) {
                    alert('Не удалось скопировать ссылку');
                }

                document.body.removeChild(tempInput);
            }
        }
    });
}