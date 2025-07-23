package com.a404.duckonback.service;

import com.a404.duckonback.entity.User;
import com.a404.duckonback.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserByUuid(String uuid) {
        return userRepository.findById(uuid);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(String uuid, User updatedUser) {
        return userRepository.findById(uuid)
                .map(user -> {
                    user.setEmail(updatedUser.getEmail());
                    user.setUserId(updatedUser.getUserId());
                    user.setPassword(updatedUser.getPassword());
                    user.setNickname(updatedUser.getNickname());
                    user.setImgUrl(updatedUser.getImgUrl());
                    user.setLanguage(updatedUser.getLanguage());
                    user.setRole(updatedUser.getRole());
                    return userRepository.save(user);
                })
                .orElseThrow(() -> new IllegalArgumentException("User not found with uuid: " + uuid));
    }

    @Override
    public void deleteUser(String uuid) {
        userRepository.deleteById(uuid);
    }
}
