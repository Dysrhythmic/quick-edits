import './style.css'

const submit = document.getElementById('submit');
const submitBtn = document.getElementById('submit-btn');
const uploadBtn = document.getElementById('upload-btn');
const input = document.getElementById('upload');
const options = document.querySelector('.options');
const fileReader = new FileReader();
const img = document.getElementById('img');

const grayscale = document.getElementById('grayscale');
const resize = document.getElementById('resize');
const exactResize = document.getElementById('exact-resize');
const contrast = document.getElementById('contrast');
const brightness = document.getElementById('brightness');
const rotate = document.getElementById('rotate');
const crop = document.getElementById('crop');

const optionController = () => {
    const dimensions = [document.getElementById('height-field'), document.getElementById('width-field')];
    if (resize.checked | exactResize.checked | crop.checked) {
        dimensions.forEach(field => {
            if (field.classList.contains('hide')) {
                field.classList.remove('hide');
            }
        });
    }
    else {
        dimensions.forEach(field => {
            if (!field.classList.contains('hide')) {
                field.classList.add('hide');
            }
        });
    }

    const amount = document.getElementById('amount-field');
    if (contrast.checked | brightness.checked) {
        if (amount.classList.contains('hide')) {
            amount.classList.remove('hide');
        }
    }
    else {
        amount.classList.add('hide')
    }

    const xyFields = [document.getElementById('x-amount-field'), document.getElementById('y-amount-field')];
    if (crop.checked) {
        xyFields.forEach(field => {
            if (field.classList.contains('hide')) {
                field.classList.remove('hide');
            }
        });

        const canvas = document.getElementById('canvas');

        img.classList.add('hide');

        canvas.width = img.width;
        canvas.height = img.height;
        canvas.classList.remove('hide');

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        let x = xyFields[0].value;
        let y = xyFields[1].value;
        let mousedown = false;
        canvas.addEventListener('mousedown', e => {
            x = e.offsetX;
            y = e.offsetY;
            mousedown = true;
        });

        let height = document.getElementById('height');
        let width = document.getElementById('width');
        
        canvas.addEventListener('mousemove', e => {
            if (mousedown) {
                width = e.offsetX - x;
                height = e.offsetY - y;
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.rect(x, y, width, height);
                ctx.stroke();
            }
        });

        canvas.addEventListener("mouseup", () => {
            mousedown = false;
            document.getElementById('height').value = height;
            document.getElementById('width').value = width;
            document.getElementById('x-amount').value = x;
            document.getElementById('y-amount').value = y;
        });
    }
    else {
        xyFields.forEach(field => {
            if (!field.classList.contains('hide')) {
                field.classList.add('hide');
            }
        });
    }

    const rotateSelection = document.getElementById('rotate-selection');
    if (rotate.checked) {
        if (rotateSelection.classList.contains('hide')) {
            rotateSelection.classList.remove('hide');
        }
    }
    else {
        rotateSelection.classList.add('hide')
    }
}

const processImage = (img, rustApp) => {
    const base64 = img.src.replace(/^data:image\/(png|jpeg);base64,/, '');
    let img_data_url = '';
    
    if (resize.checked | exactResize.checked | crop.checked) {
        const height = parseInt(document.getElementById('height').value);
        const width = parseInt(document.getElementById('width').value);

        if (resize.checked) {
            img_data_url = rustApp.resize_img(base64, height, width);
        }
        else if (exactResize.checked) {
            img_data_url = rustApp.exact_resize_img(base64, height, width);
        }
        else if (crop.checked) {
            const x = parseInt(document.getElementById('x-amount').value);
            const y = parseInt(document.getElementById('y-amount').value);

            img_data_url = rustApp.crop_img(base64, height, width, x, y);
        }
    }
    else if (grayscale.checked) {
        img_data_url = rustApp.grayscale_img(base64);
    }
    else if (contrast.checked | brightness.checked) {
        const amount = parseFloat(document.getElementById('amount').value)

        if (contrast.checked) {
            img_data_url = rustApp.adjust_img_contrast(base64, amount);
        }
        else if (brightness.checked) {
            img_data_url = rustApp.adjust_img_brightness(base64, amount)
        }
    }
    else if (rotate.checked) {
        let degrees = 0;
        if (document.getElementById('ninety').checked) {
            degrees = 90;
        }
        else if (document.getElementById('one-eighty').checked) {
            degrees = 180;
        }
        else if (document.getElementById('two-seventy').checked) {
            degrees = 270;
        }

        img_data_url = rustApp.rotate(base64, degrees);
    }

    document.getElementById('img').setAttribute('src', img_data_url);
}

const init = async () => {
    let rustApp = null;

    try {
        rustApp = await import('../pkg');
    }
    catch(err) {
        console.error(err);
        return;
    }

    fileReader.onloadend = () => {
        if (options.classList.contains('hide')) {
            options.classList.remove('hide');
        }

        if (submitBtn.classList.contains('hide')) {
            submitBtn.classList.remove('hide');
        }

        if (!uploadBtn.classList.contains('hide')) {
            uploadBtn.classList.add('hide');
        }

        img.setAttribute('src', fileReader.result);
    };

    input.addEventListener('change', () => {
        fileReader.readAsDataURL(input.files[0]);
    });

    options.addEventListener('click', optionController);

    submit.addEventListener('click', () => {
        processImage(img, rustApp);
        
        if (img.classList.contains('hide')) {
            img.classList.remove('hide');
            canvas.classList.add('hide');
        }
    });
}

init()
