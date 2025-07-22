package com.a404.duckonback.entity;

import java.io.Serializable;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserBlockId implements Serializable {
    private String blocker;
    private String blocked;
}
