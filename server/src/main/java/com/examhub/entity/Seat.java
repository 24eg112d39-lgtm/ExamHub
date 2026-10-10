package com.examhub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "seats",
    uniqueConstraints = @UniqueConstraint(name = "uq_hall_seat", columnNames = {"hall_id", "seat_number"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hall_id", nullable = false)
    private ExamHall hall;

    @Column(name = "row_number", nullable = false)
    private Integer rowNumber;

    @Column(name = "column_number", nullable = false)
    private Integer columnNumber;

    @Column(name = "seat_number", nullable = false, length = 30)
    private String seatNumber;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
