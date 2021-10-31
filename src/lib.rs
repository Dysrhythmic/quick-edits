use wasm_bindgen::prelude::wasm_bindgen;
use web_sys::console::log_1 as log;
use base64::{decode, encode};
use image::load_from_memory;
use image::ImageOutputFormat::Png;
use image::imageops;

enum Degrees {
    D90,
    D180,
    D270
}

impl Degrees {
    fn from_int(degrees: i32) -> Result<Degrees, String> {
        match degrees {
            90 => Ok(Degrees::D90),
            180 => Ok(Degrees::D180),
            270 => Ok(Degrees::D270),
            _ => Err("Error: invalid degree input".to_owned())
        }
    }
}

fn decode_image(encoded_img: &str) -> Vec<u8> {
    // base64 to vector
    decode(encoded_img).unwrap()
}

fn load_image(decoded_img: Vec<u8>) -> image::DynamicImage {
    // vector to dynamic image
    load_from_memory(&decoded_img).unwrap()
}

fn write_image(img: image::DynamicImage) -> Vec<u8> {
    // write to png
    let mut buffer = vec![];
    img.write_to(&mut buffer, Png).unwrap();

    buffer
}

fn encode_image(buffer: Vec<u8>) -> String {
    // encode to data url
    let encoded_img = encode(&buffer);
    format!("data:image/png;base64,{}", encoded_img)
}

fn unpack_image(encoded_img: &str) -> image::DynamicImage {
    // prepare received image for editing
    let decoded_img = decode_image(encoded_img);
    log(&"Image decoded from string to octets".into());

    let img = load_image(decoded_img);
    log(&"Dynamic image loaded".into());

    img
}

fn pack_image(img: image::DynamicImage) -> String {
    // prepare edited image for returning to JS
    let buffer = write_image(img);
    log(&"Dynamic image written as png".into());

    let encoded_image = encode_image(buffer);
    log(&"Image encoded as string".into());

    encoded_image
}

#[wasm_bindgen]
pub fn grayscale_img(encoded_img: &str) -> String {
    let grayscale_img = unpack_image(encoded_img).grayscale();

    pack_image(grayscale_img)
}

#[wasm_bindgen]
pub fn resize_img(encoded_img: &str, height: u32, width: u32) -> String {
    let resized_img = unpack_image(encoded_img).resize(width, height, imageops::Lanczos3);

    pack_image(resized_img)
}

#[wasm_bindgen]
pub fn exact_resize_img(encoded_img: &str, height: u32, width: u32) -> String {
    let resized_img = unpack_image(encoded_img).resize_exact(width, height, imageops::Lanczos3);

    pack_image(resized_img)
}

#[wasm_bindgen]
pub fn adjust_img_contrast(encoded_img: &str, amount: f32) -> String {
    let adjusted_img = unpack_image(encoded_img).adjust_contrast(amount);

    pack_image(adjusted_img)
}

#[wasm_bindgen]
pub fn adjust_img_brightness(encoded_img: &str, amount: i32) -> String {
    let adjusted_img = unpack_image(encoded_img).brighten(amount);

    pack_image(adjusted_img)
}

fn rotate_img(encoded_img: &str, degrees: Degrees) -> image::DynamicImage {
    match degrees {
        Degrees::D90 => unpack_image(encoded_img).rotate90(),
        Degrees::D180 => unpack_image(encoded_img).rotate180(),
        Degrees::D270 => unpack_image(encoded_img).rotate270()
    }
}

#[wasm_bindgen]
pub fn rotate(encoded_img: &str, degrees_input: i32) -> String {  
    let rotated_img = match Degrees::from_int(degrees_input) {
        Ok(degrees) => rotate_img(encoded_img, degrees), 
        Err(e) => {
            log(&e.into());
            unpack_image(encoded_img)
         }
    };

    pack_image(rotated_img)
}