package com.example.buensaborback.services;

import com.example.buensaborback.domain.entities.ArticuloInsumo;
import com.example.buensaborback.repositories.ArticuloInsumoRepository;
import com.example.buensaborback.repositories.BaseRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class ArticuloInsumoServiceImpl extends BaseServiceImpl<ArticuloInsumo, Long> implements ArticuloInsumoService{

    private ArticuloInsumoRepository articuloInsumoRepository;
    public ArticuloInsumoServiceImpl(ArticuloInsumoRepository articuloInsumoRepository) {
        super(articuloInsumoRepository);
        this.articuloInsumoRepository = articuloInsumoRepository;
    }
}
