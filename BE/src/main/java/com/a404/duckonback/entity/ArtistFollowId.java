package com.a404.duckonback.entity;

import lombok.*;
import java.io.Serializable;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ArtistFollowId implements Serializable {
    private String user;       // User.uuid
    private Integer artist;    // Artist.artistId
}
