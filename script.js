// 当用户选择文件时
document.getElementById('upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // 检查文件大小
        if (file.size > 10 * 1024 * 1024) { // 10MB
            alert('文件太大了！请选择10MB以下的图片');
            return;
        }

        // 显示原始文件大小
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        document.getElementById('originalSize').textContent = 
            `大小: ${originalSize} MB`;

        // 显示原始图片
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('originalImage');
            img.src = e.target.result;
            
            // 图片加载完成后进行压缩
            img.onload = function() {
                compressImage(img, file.type);
            };
        };
        reader.readAsDataURL(file);
    }
});

// 压缩图片
function compressImage(img, type) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置压缩后的尺寸
    let width = img.width;
    let height = img.height;
    
    // 增加最大尺寸限制到2000px
    const maxSize = 2000;
    if (width > maxSize || height > maxSize) {
        if (width > height) {
            height = Math.round(height * maxSize / width);
            width = maxSize;
        } else {
            width = Math.round(width * maxSize / height);
            height = maxSize;
        }
    }

    // 使用更高质量的渲染
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // 获取用户设置的压缩质量，默认值改为0.9
    const quality = document.getElementById('quality').value / 100;

    // 压缩图片
    canvas.toBlob(function(blob) {
        // 如果压缩后比原图大，使用原图
        if (blob.size > img.size) {
            const compressedImg = document.getElementById('compressedImage');
            compressedImg.src = img.src;
            document.getElementById('compressedSize').textContent = 
                `大小: ${(img.size / 1024 / 1024).toFixed(2)} MB (使用原图)`;
            return;
        }

        // 显示压缩后的图片
        const compressedImg = document.getElementById('compressedImage');
        compressedImg.src = URL.createObjectURL(blob);

        // 显示压缩后的文件大小
        const compressedSize = (blob.size / 1024 / 1024).toFixed(2);
        document.getElementById('compressedSize').textContent = 
            `大小: ${compressedSize} MB`;

        // 启用下载按钮
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = false;
        downloadBtn.onclick = function() {
            // 创建下载链接
            const link = document.createElement('a');
            link.href = compressedImg.src;
            link.download = '压缩后的图片.' + type.split('/')[1];
            link.click();
        };
    }, type, quality);
}

// 更新压缩质量显示
document.getElementById('quality').addEventListener('input', function() {
    document.getElementById('qualityValue').textContent = this.value + '%';
    // 如果已经有图片，重新压缩
    const img = document.getElementById('originalImage');
    if (img.src) {
        compressImage(img, 'image/jpeg');
    }
});

// 设置默认压缩质量为90%
document.getElementById('quality').value = 90;
document.getElementById('qualityValue').textContent = '90%';
