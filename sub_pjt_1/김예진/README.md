# 1주차

### 1. 역할 분담

- 백엔드 개발
- 발표

### 2. 기획 구체화

- 아이돌 팬덤이 사용할 수 있는 동시 시청 서비스 아이디어 제시
- 유저간 차단, 신고 등 정책 결정
- 와이어프레임 생성
- 유저 플로우 정리

### 3. WebRTC 활용 토이 프로젝트 수행

- 실시간 화상 채팅 웹 서비스 코드 작성

```java
package com.jinnie.videocall.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {

    private final UserService service;

    @PostMapping
    public void register(User user) {
        service.register(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User user) {
        return service.login(user);
    }

    @PostMapping("/logout")
    public void logout(@RequestBody String email){
        service.logout(email);
    }

    @GetMapping
    public List<User> findAll() {
        return service.findAll();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getMessage());
    }
}

```
