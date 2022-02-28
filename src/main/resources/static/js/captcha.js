onPageReady();

function onPageReady(){
    var $btn = document.querySelector('.btn');
    var $modal = document.querySelector('.slider-captcha');
    $btn.onmousedown = function(){
        $modal.setAttribute("style", "display: block");
    };

    ['.captcha-mask'].forEach(function(selector){
        var $el = $modal.querySelector(selector);
        $el.onmousedown = hideModal;

    });

    var $sliderOne = document.querySelector('.slider.one');
    var $sliderTwo = document.querySelector('.slider.two');


    $sliderOne.addEventListener("mousedown", function(event){
        sliderListener(event, ".one");
    })
    $sliderTwo.addEventListener("mousedown", function(event){
        sliderListener(event, ".two");
    })


    function hideModal(){
        $modal.setAttribute("style", "display: none");
    }

};

function calculateImageMoveX(moveX, scaleX, imageWidth, maxMove){
    if (moveX / maxMove <= 1 / (1 + scaleX)){
        return moveX * imageWidth / maxMove * scaleX;
    }else {
        return imageWidth * scaleX / (1 + scaleX) + (moveX - maxMove / (1 + scaleX)) * imageWidth / maxMove / scaleX;
    }
}


function sliderListener(event, selector){
    var moveEnable = true;
    var mousedownFlag = false;
    var sliderInitOffset = 0;
    var MIN_MOVE = 0;
    var MAX_MOVE = 260;
    var scaleX = 1;
    var moveX = 0;

    var $slider = document.querySelector('.slider'+selector);
    var $sliderMask = document.querySelector('.sliderMask'+selector);
    var $sliderContainer = document.querySelector('.sliderContainer'+selector);
    var $answer = document.querySelector('.answerImg'+selector);
    var imageWidth = $answer.offsetWidth * 0.6;

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
        checkLocation(imgMoveX, selector);
        document.onmousemove = null;
        document.onmouseup = null;

    }

}

function checkAllSuccess(){
    return checkSuccess(".one") && checkSuccess(".two");
}

function checkSuccess(selector){
    var $sliderContainer = document.querySelector('.sliderContainer'+selector);
    return $sliderContainer.classList.contains("sliderContainer_success");
}

function success(){
    console.log("success");
    alert("success");
    resetAll();
}

function resetAll(){
    reset(".one");
    reset(".two");
}

function reset(selector){
    var $slider = document.querySelector('.slider'+selector);
    var $sliderMask = document.querySelector('.sliderMask'+selector);
    var $sliderContainer = document.querySelector('.sliderContainer'+selector);
    var $answer = document.querySelector('.answerImg'+selector);

    $sliderContainer.classList.remove("sliderContainer_success");
    $sliderContainer.classList.remove("sliderContainer_fail");
    $sliderContainer.classList.remove("sliderContainer_active");
    $slider.setAttribute("style","left:0px");
    $sliderMask.setAttribute("style","width:0px");
    $answer.setAttribute("style","left:0px");
}

function checkLocation(move, selector){
    var $sliderContainer = document.querySelector('.sliderContainer'+selector);

    const Http = new XMLHttpRequest();
    const url='http://localhost:8080/checkLocation';
    Http.open("POST", url);
    Http.send(JSON.stringify({
        moveX: move,
        answerIndex: selector === ".one" ? 10 : 1,
    }));

    Http.onreadystatechange = function (){
        if(Http.readyState === XMLHttpRequest.DONE && Http.status === 200) {
            checkResult = JSON.parse(Http.response);

            if(checkResult){
                $sliderContainer.classList.add("sliderContainer_success");
                $sliderContainer.removeEventListener("mousedown", function(event){
                    sliderListener(event, selector);
                });
                if(checkAllSuccess()){
                    setTimeout(function (){
                        success();
                    }, 500);
                }
            }else{
                $sliderContainer.classList.add("sliderContainer_fail");
                setTimeout(function (){
                    resetAll();
                }, 500);
            }
        }
    }

}