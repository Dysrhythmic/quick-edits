import './style.css'

const grayscale = document.getElementById('grayscale');
const resize = document.getElementById('resize');
const exactResize = document.getElementById('exact-resize');
const contrast = document.getElementById('contrast');
const brightness = document.getElementById('brightness');
const rotate = document.getElementById('rotate');
const submit = document.getElementById('submit');
const submitBtn = document.getElementById('submit-btn');
const uploadBtn = document.getElementById('upload-btn');
const input = document.getElementById('upload');
const options = document.querySelector('.options');
const fileReader = new FileReader();

function optionController(){
    const dimensions = [document.getElementById('height-field'), document.getElementById('width-field')];
    if (resize.checked | exactResize.checked) {
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

function processImage(img, rustApp) {
    const base64 = img.src.replace(/^data:image\/(png|jpeg);base64,/, '');
    let img_data_url = '';
    if (resize.checked) {
        const height = parseInt(document.getElementById('height').value);
        const width = parseInt(document.getElementById('width').value);
        img_data_url = rustApp.resize_img(base64, height, width);
    }
    else if (exactResize.checked) {
        const height = parseInt(document.getElementById('height').value);
        const width = parseInt(document.getElementById('width').value);
        img_data_url = rustApp.exact_resize_img(base64, height, width);
    }
    else if (grayscale.checked) {
        img_data_url = rustApp.grayscale_img(base64);
    }
    else if (contrast.checked) {
        const amount = parseFloat(document.getElementById('amount').value)
        img_data_url = rustApp.adjust_img_contrast(base64, amount)
    }
    else if (brightness.checked) {
        const amount = parseInt(document.getElementById('amount').value)
        img_data_url = rustApp.adjust_img_brightness(base64, amount)
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

async function init() {
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
        document.getElementById('img').setAttribute('src', fileReader.result)
    };

    input.addEventListener('change', () => {
        fileReader.readAsDataURL(input.files[0]);
    });

    options.addEventListener('click', optionController);

    submit.addEventListener('click', () => {
        const img = document.getElementById('img');
        processImage(img, rustApp);
    });
}

init()