//
//  ViewController.swift
//  PokeBot
//
//  Created by Jacopo Mangiavacchi on 5/1/18.
//  Copyright © 2018 Jacopo Mangiavacchi. All rights reserved.
//

import UIKit
import AudioToolbox

class ViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, UITextFieldDelegate {

    @IBOutlet weak var searchView: UIView!
    @IBOutlet weak var searchTextField: UITextField!
    
    @IBOutlet weak var collectionView: UICollectionView!
    
    override func viewDidLoad() {
        super.viewDidLoad()

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

        UIView.animate(withDuration: 0.3/*Animation Duration second*/, animations: {
            self.collectionView.alpha = 0
            self.searchView.alpha = 1
        }, completion:  nil)

        searchTextField.keyboardAppearance = .dark //.default//.light//.alert
        
        searchTextField.becomeFirstResponder()
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        
        //START SEARCH
        
        collectionView.reloadData()
        
        searchTextField.resignFirstResponder()
        UIView.animate(withDuration: 0.3/*Animation Duration second*/, animations: {
            self.collectionView.alpha = 1
            self.searchView.alpha = 0
        }, completion:  nil)

        return true
    }
    
    
    // MARK: UICollectionViewDataSource
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 1
    }
    
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        // #warning Incomplete implementation, return the number of items
        return 5
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "Cell", for: indexPath)
        
        // Configure the cell
        
        return cell
    }

}

