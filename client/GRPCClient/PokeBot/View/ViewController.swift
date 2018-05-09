//
//  ViewController.swift
//  PokeBot
//
//  Created by Jacopo Mangiavacchi on 5/1/18.
//  Copyright © 2018 Jacopo Mangiavacchi. All rights reserved.
//

import UIKit
import AudioToolbox
import Kingfisher
import SwiftGRPC


class ViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, UITextFieldDelegate {

    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var searchTextField: UITextField!
    
    @IBOutlet weak var collectionView: UICollectionView!
    
    @IBOutlet weak var loadingActivityIndicator: UIActivityIndicatorView!
    
    @IBOutlet weak var headerLabel: UILabel!
    
    var pokemons = [Pokebot_Pokemon]()
    
    var client: Pokebot_PokeBotServiceClient!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        gRPC.initialize()
        print("GRPC version \(gRPC.version)")

        let layout = UICollectionViewFlowLayout()
        layout.sectionInset = UIEdgeInsets(top: 0, left: 10, bottom: 0, right: 10)
        layout.minimumInteritemSpacing = 0.0
        layout.minimumLineSpacing = 10.0
        layout.itemSize = CGSize(width: collectionView.frame.width - 20, height: collectionView.frame.height)
        layout.scrollDirection = .horizontal
        
        collectionView.collectionViewLayout = layout
        collectionView.delegate = self
        collectionView.dataSource = self
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func showSearch(_ sender: Any) {
        AudioServicesPlayAlertSound(SystemSoundID(kSystemSoundID_Vibrate))
        
        searchTextField.text = ""
        headerLabel.text = "Enter the name of a Pokemon or Type"

        UIView.animate(withDuration: 0.3, animations: {
            self.collectionView.alpha = 0
            self.searchView.alpha = 1
        }, completion:  nil)

        searchTextField.keyboardAppearance = .dark //.default//.light//.alert
        
        searchTextField.becomeFirstResponder()
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        pokemons = [Pokebot_Pokemon]()
        collectionView.reloadData()

        if let text = searchTextField.text {
            searchNewPokemon(searchText: text)
        }
        
        searchTextField.resignFirstResponder()
        UIView.animate(withDuration: 0.3, animations: {
            self.collectionView.alpha = 1
            self.searchView.alpha = 0
        }, completion:  nil)

        return true
    }
    
    func searchNewPokemon(searchText: String) {
        headerLabel.text = "Searching..."
        loadingActivityIndicator.startAnimating()

        do {
            var input = Pokebot_PokeInput()
            input.name = searchText
            
            self.client = Pokebot_PokeBotServiceClient(address: "0.tcp.ngrok.io:10423", secure: false)
            
            let event = try self.client.searchPokemon(input, completion: { (result) in
                print(result)
            })
            
            try event.receive { (result) in
                DispatchQueue.main.async {
                    if let error = result.error {
                        print(error)
                        self.loadingActivityIndicator.stopAnimating()
                        self.headerLabel.text = "Found no Pokemons"
                    }
                    else if let newPokemon = result.result! {
                        self.loadingActivityIndicator.stopAnimating()
                        self.pokemons.append(newPokemon)
                        self.headerLabel.text = "Found \(self.pokemons.count) Pokemons"
                        self.collectionView.reloadData()
                    }
                }
            }
        } catch {
            print(error)
        }
    }
    
    // MARK: UICollectionViewDataSource
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return pokemons.count
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "PokemonCell", for: indexPath) as! PokemonCell
        
        let pokemon = pokemons[indexPath.row]
        
        let url = URL(string: pokemon.image)
        cell.imageView.kf.setImage(with: url)
        cell.nameLabel.text = pokemon.name
        cell.typeLabel.text = pokemon.types.reduce("") { $0 + " " + $1 }
        cell.heightLabel.text = String(format: "Height: %d cm", pokemon.height)
        cell.weightLabel.text = String(format: "Width: %d cm", pokemon.weight)
        cell.habitatLabel.text = "Lives in \(pokemon.habitats)"
        cell.flavorTextLabel.text = pokemon.flavorText
        
        return cell
    }

}

