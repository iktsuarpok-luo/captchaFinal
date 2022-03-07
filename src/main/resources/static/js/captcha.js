onPageReady();

function onPageReady(){
    var $modal = document.querySelector('.slider-captcha');

    ['.captcha-mask'].forEach(function(selector){
        var $el = $modal.querySelector(selector);
        $el.onmousedown = hideModal;

    });

    var $slider = document.querySelector('.slider');


    $slider.addEventListener("mousedown", function(event){
        sliderListener(event);
    })

    function hideModal(){
        var href = location.host;
        window.location.href= href;
    }

};

function calculateImageMoveX(moveX, scaleX, imageWidth, maxMove){
    if (moveX / maxMove <= 1 / (1 + scaleX)){
        return moveX * imageWidth / maxMove * scaleX;
    }else {
        return imageWidth * scaleX / (1 + scaleX) + (moveX - maxMove / (1 + scaleX)) * imageWidth / maxMove / scaleX;
    }
}


function sliderListener(event){
    var moveEnable = true;
    var mousedownFlag = false;
    var sliderInitOffset = 0;
    var scaleX = 1;
    var moveX = 0;

    var $slider = document.querySelector('.slider');
    var $sliderMask = document.querySelector('.sliderMask');
    var $sliderContainer = document.querySelector('.sliderContainer');
    var $answer = document.querySelector('.answerImg');
    var imageWidth = $answer.offsetWidth * 0.9;
    var MIN_MOVE = 0;
    var MAX_MOVE = $sliderContainer.offsetWidth - $slider.offsetWidth;
    console.log(MAX_MOVE);

    $sliderContainer.classList.add("sliderContainer_active");
    sliderInitOffset = event.clientX;
    mousedownFlag = true;
    document.onmousemove=function(event){
        if(mousedownFlag  == false){
            return;
        }
        if(moveEnable == false){
            return
        }

        moveX = event.clientX - sliderInitOffset;

        moveX<MIN_MOVE?moveX=MIN_MOVE:moveX=moveX;
        moveX>MAX_MOVE?moveX=MAX_MOVE:moveX=moveX;


        var imageMoveX = calculateImageMoveX(moveX, scaleX, imageWidth, MAX_MOVE);

        $slider.setAttribute("style","left:" + moveX + "px");
        $sliderMask.setAttribute("style","width:" + moveX + "px");
        $answer.setAttribute("style","left: -" + imageMoveX + "px");
    }

    document.onmouseup = function(event){
        var imgMoveX = moveX * imageWidth / MAX_MOVE;
        sliderInitOffset = 0;
        mousedownFlag=false;
        checkLocation(imgMoveX);
        document.onmousemove = null;
        document.onmouseup = null;

    }

}

function success(){
    console.log("success");
    alert("success");
    reset();
}

function reset(){
    var $slider = document.querySelector('.slider');
    var $sliderMask = document.querySelector('.sliderMask');
    var $sliderContainer = document.querySelector('.sliderContainer');
    var $answer = document.querySelector('.answerImg');

    $sliderContainer.classList.remove("sliderContainer_success");
    $sliderContainer.classList.remove("sliderContainer_fail");
    $sliderContainer.classList.remove("sliderContainer_active");
    $slider.setAttribute("style","left:0px");
    $sliderMask.setAttribute("style","width:0px");
    $answer.setAttribute("style","left:0px");
}

function checkLocation(move){
    var $sliderContainer = document.querySelector('.sliderContainer');

    const Http = new XMLHttpRequest();
    const url='http://localhost:8080/checkLocation';
    Http.open("POST", url);
    Http.send(JSON.stringify({
        moveX: move,
    }));

    Http.onreadystatechange = function (){
        if(Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {
            checkResult = JSON.parse(Http.response);

            if(checkResult){
                $sliderContainer.classList.add("sliderContainer_success");
                $sliderContainer.removeEventListener("mousedown", function(event){
                    sliderListener(event, selector);
                });

                setTimeout(function (){
                    success();
                }, 500);

            }else{
                $sliderContainer.classList.add("sliderContainer_fail");
                setTimeout(function (){
                    reset();
                }, 500);
            }
        }else if(Http.readyState === XMLHttpRequest.DONE && Http.status === 500) {
            alert("The session is outdated. Please try reload!");
            return;
        }
    }

}